const SHEET_ID = "1RjwacSKp30pA-W3swCD8-kPxgfBVflGu70bJnF8ON4w";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
const fallbackRaw = window.DASHBOARD_DATA || { generatedAt: "", project: [], sales: [] };
const credentials = { id: "ggumbi", password: "hihi" };
const colors = ["#316bff", "#18a999", "#f0a500", "#d95d5d", "#7a5cff", "#64748b"];
const stageOrder = ["기획", "샘플 제작 및 테스트", "인증", "양산 전 테스트", "발주 및 양산", "런칭"];

let projects = [];
let sales = [];
let loadedAt = "";

const state = {
  brand: "전체",
  month: "전체",
  query: "",
};

const $ = (id) => document.getElementById(id);
const numberFmt = new Intl.NumberFormat("ko-KR");

function money(value) {
  return `${numberFmt.format(Math.round(Number(value) || 0))}원`;
}

function numericValue(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[,원\s]/g, "").replace(/[–-]/g, "");
  return Number(normalized) || 0;
}

function shortMoney(value) {
  const num = Number(value) || 0;
  if (num >= 100000000) return `${(num / 100000000).toFixed(1).replace(".0", "")}억`;
  if (num >= 10000) return `${Math.round(num / 10000).toLocaleString("ko-KR")}만`;
  return numberFmt.format(num);
}

function percent(value) {
  return `${Math.round((Number(value) || 0) * 10) / 10}%`;
}

function costPercent(value) {
  return percent((Number(value) || 0) * 100);
}

function annualRevenue(item) {
  const monthlyTotal = Array.from({ length: 12 }, (_, index) => Number(item[`${index + 1}월 매출`]) || 0)
    .reduce((sum, value) => sum + value, 0);
  return monthlyTotal || (Number(item["누적매출"]) || 0);
}

function auth(value) {
  localStorage.setItem("ggumbi-dashboard-auth", value ? "true" : "false");
  $("loginScreen").hidden = value;
  $("appShell").hidden = !value;
}

function normalizeDateLike(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value !== "string") return value;
  const match = value.match(/Date\((\d+),(\d+),(\d+)/);
  if (!match) return value;
  const year = Number(match[1]);
  const month = String(Number(match[2]) + 1).padStart(2, "0");
  const day = String(Number(match[3])).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseCell(label, cell) {
  if (!cell) return null;
  if (label.includes("일") && cell.f) return cell.f;
  const value = cell.v ?? cell.f ?? null;
  return normalizeDateLike(value);
}

function gvizToRows(response) {
  if (!response?.table?.cols || !response?.table?.rows) return [];
  const headers = response.table.cols.map((col, index) => col.label || `col${index}`);
  return response.table.rows
    .map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        if (!header) return;
        item[header] = parseCell(header, row.c[index]);
      });
      return item;
    })
    .filter((item) => Object.values(item).some((value) => value !== null && value !== ""));
}

function loadSheet(sheetName) {
  return new Promise((resolve, reject) => {
    const callbackName = `__ggumbiSheet_${sheetName}_${Date.now()}_${Math.round(Math.random() * 10000)}`;
    const script = document.createElement("script");
    const tqx = `out:json;responseHandler:${callbackName}`;
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(sheetName)}&headers=1&tqx=${encodeURIComponent(tqx)}`;

    window[callbackName] = (response) => {
      delete window[callbackName];
      script.remove();
      if (response?.status === "error") {
        reject(new Error(response.errors?.[0]?.detailed_message || `${sheetName} 시트를 읽지 못했습니다.`));
        return;
      }
      resolve(gvizToRows(response));
    };

    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error(`${sheetName} 시트 연결에 실패했습니다.`));
    };

    script.src = url;
    document.head.appendChild(script);
  });
}

async function loadLiveData() {
  $("dataStatus").textContent = "Google Sheets 연결 중";
  try {
    const [projectRows, salesRows] = await Promise.all([loadSheet("Project"), loadSheet("Sales")]);
    projects = projectRows.filter((item) => item["상품명"]);
    sales = salesRows.filter((item) => item["월"]);
    loadedAt = new Date().toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
    $("dataStatus").textContent = "실시간 연결";
  } catch (error) {
    projects = (fallbackRaw.project || []).filter((item) => item["상품명"]);
    sales = (fallbackRaw.sales || []).filter((item) => item["월"]);
    loadedAt = fallbackRaw.generatedAt || "임시 저장 데이터";
    $("dataStatus").textContent = "실시간 연결 실패 · 임시 데이터 표시";
    console.warn(error);
  }
}

function currentItems() {
  const query = state.query.trim().toLowerCase();
  return projects.filter((item) => {
    const brandOk = state.brand === "전체" || item["브랜드"] === state.brand;
    const queryOk = !query || String(item["상품명"]).toLowerCase().includes(query);
    const monthOk =
      state.month === "전체" ||
      Number(item[`${state.month} 매출`]) > 0 ||
      dateMonth(item["런칭일"]) === state.month ||
      dateMonth(item["예상입고일"]) === state.month;
    return brandOk && monthOk && queryOk;
  });
}

function unique(key) {
  return ["전체", ...new Set(projects.map((item) => item[key]).filter(Boolean))];
}

function fillSelect(id, values) {
  $(id).innerHTML = values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function groupSum(items, key, valueKey) {
  return items.reduce((acc, item) => {
    const label = item[key] || "미지정";
    const value = valueKey === "annualRevenue" ? annualRevenue(item) : Number(item[valueKey]) || 0;
    acc[label] = (acc[label] || 0) + value;
    return acc;
  }, {});
}

function groupCount(items, key) {
  return items.reduce((acc, item) => {
    const label = item[key] || "미지정";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
}

function dateMonth(value) {
  if (!value) return "";
  const text = String(value);
  const match = text.match(/^(\d{4})[-.]\s*(\d{1,2})/);
  return match ? `${Number(match[2])}월` : "";
}

function parseDateValue(value) {
  if (!value) return null;
  const text = String(value);
  const match = text.match(/^(\d{4})[-.]\s*(\d{1,2})[-.]\s*(\d{1,2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function isCurrentMonthOrSoon(value, days = 14) {
  const date = parseDateValue(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setDate(today.getDate() + days);
  return dateMonth(value) === `${today.getMonth() + 1}월` || (date >= today && date <= soon);
}

function sortByDate(items, key) {
  return [...items]
    .filter((item) => item[key])
    .sort((a, b) => String(a[key]).localeCompare(String(b[key])));
}

function renderOptions() {
  fillSelect("brandFilter", unique("브랜드"));
  fillSelect("monthFilter", ["전체", ...Array.from({ length: 12 }, (_, index) => `${index + 1}월`)]);
}

function renderSidebar(items) {
  const revenue = items.reduce((sum, item) => sum + annualRevenue(item), 0);
  const launched = items.filter((item) => item["개발단계"] === "런칭").length;
  const active = items.length - launched;
  const schedule = items
    .filter((item) => item["개발단계"] !== "런칭" && (isCurrentMonthOrSoon(item["런칭일"]) || isCurrentMonthOrSoon(item["예상입고일"])))
    .sort((a, b) => String(a["런칭일"] || a["예상입고일"]).localeCompare(String(b["런칭일"] || b["예상입고일"])))
    .slice(0, 2);

  $("sideRevenue").textContent = shortMoney(revenue);
  $("sideLaunched").textContent = `${numberFmt.format(launched)}개`;
  $("sideActive").textContent = `${numberFmt.format(Math.max(active, 0))}개`;
  $("sideSchedule").innerHTML = schedule.length
    ? schedule.map((item) => `<li><span>${item["예상입고일"] || item["런칭일"]} 입고</span>${item["상품명"]} · 런칭 예정</li>`).join("")
    : "<li>이번 달 주요 일정 없음</li>";
}

function renderKpis(items) {
  const launched = items.filter((item) => item["개발단계"] === "런칭").length;
  const active = items.length - launched;
  const revenue = items.reduce((sum, item) => sum + annualRevenue(item), 0);
  const costRates = items.map((item) => Number(item["원가율"])).filter((value) => value > 0);
  const avgCost = costRates.reduce((sum, value) => sum + value, 0) / (costRates.length || 1);

  $("kpiProjects").textContent = numberFmt.format(items.length);
  $("kpiActive").textContent = `개발 진행 ${numberFmt.format(Math.max(active, 0))}개`;
  $("kpiLaunched").textContent = numberFmt.format(launched);
  $("kpiLaunchRate").textContent = `런칭 비중 ${percent((launched / (items.length || 1)) * 100)}`;
  $("kpiRevenue").textContent = shortMoney(revenue);
  $("kpiRevenueText").textContent = `올해 누적 ${money(revenue)}`;
  $("kpiCostRate").textContent = costPercent(avgCost);
  $("kpiCostWatch").textContent = `원가율 55% 이상 ${items.filter((item) => Number(item["원가율"]) >= 0.55).length}개`;
}

function monthlySalesFromProjects(items) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${index + 1}월`;
    const key = `${month} 매출`;
    const value = items.reduce((sum, item) => sum + numericValue(item[key]), 0);
    return { 월: month, 누적매출: value, 목표매출: monthlySalesTarget(index + 1, items) };
  });
}

function monthNumber(value) {
  const match = String(value || "").match(/(\d{1,2})/);
  return match ? Number(match[1]) : 0;
}

function targetValueFromRow(row, month, allowGeneric = true) {
  if (!row) return 0;
  const exactKeys = [
    `${month}월 목표매출`,
    `${month}월 목표 매출`,
    `${month}월 목표`,
    `${month}월 목표금액`,
    `${month}월 매출목표`,
    `${month}월 매출 목표`,
  ];
  for (const key of exactKeys) {
    const value = numericValue(row[key]);
    if (value > 0) return value;
  }
  if (!allowGeneric) return 0;
  const targetKey = Object.keys(row).find((key) => key.includes("목표") && !key.includes("달성"));
  return targetKey ? numericValue(row[targetKey]) : 0;
}

function monthlySalesTarget(month, items) {
  const projectTarget = items.reduce((sum, item) => sum + targetValueFromRow(item, month, false), 0);
  if (projectTarget > 0) return projectTarget;

  const salesRow = sales.find((row) => monthNumber(row["월"]) === month);
  const salesTarget = targetValueFromRow(salesRow, month);
  if (salesTarget > 0) return salesTarget;

  const fallbackTargets = {
    7: 154933417,
    8: 323700923,
    9: 295359642,
  };
  return fallbackTargets[month] || 0;
}

function salesInsight(items, fromMonth, toMonth) {
  const fromKey = `${fromMonth}월 매출`;
  const toKey = `${toMonth}월 매출`;
  const fromTotal = items.reduce((sum, item) => sum + (Number(item[fromKey]) || 0), 0);
  const toTotal = items.reduce((sum, item) => sum + (Number(item[toKey]) || 0), 0);
  const amount = toTotal - fromTotal;
  const rate = fromTotal ? (amount / fromTotal) * 100 : 0;
  const contributors = [...items]
    .map((item) => ({
      name: item["상품명"],
      brand: item["브랜드"] || "-",
      amount: (Number(item[toKey]) || 0) - (Number(item[fromKey]) || 0),
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return { fromMonth, toMonth, fromTotal, toTotal, amount, rate, contributors };
}

function renderSalesInsightCard(insight) {
  const tone = insight.amount >= 0 ? "up" : "down";
  const medals = ["🥇", "🥈", "🥉"];
  return `<section class="sales-growth-card ${tone}">
    <div class="growth-summary">
      <span>${insight.fromMonth}월 → ${insight.toMonth}월</span>
      <strong>${insight.amount >= 0 ? "▲ +" : "▼ "}${percent(Math.abs(insight.rate))}</strong>
      <em>${shortMoney(insight.fromTotal)} → ${shortMoney(insight.toTotal)}</em>
      <b>${insight.amount >= 0 ? "+" : "-"}${money(Math.abs(insight.amount))} ${insight.amount >= 0 ? "증가" : "감소"}</b>
    </div>
    <div class="growth-contributors">
      <h3>기여 TOP3</h3>
      ${
        insight.contributors.length
          ? insight.contributors
              .map((item, index) => `<div class="growth-row">
                <span>${medals[index]} ${item.name}</span>
                <strong>+${money(item.amount)}</strong>
              </div>`)
              .join("")
          : "<p>증가 기여 품목 없음</p>"
      }
    </div>
  </section>`;
}

function renderMonthlySales(items) {
  const monthlyRows = monthlySalesFromProjects(items);
  const max = Math.max(
    ...monthlyRows.map((item) => Math.max(Number(item["누적매출"]) || 0, Number(item["목표매출"]) || 0)),
    1
  );
  const total = monthlyRows.reduce((sum, item) => sum + (Number(item["누적매출"]) || 0), 0);
  const forecastTotal = monthlyRows.reduce((sum, item, index) => {
    const month = index + 1;
    if (month >= 4 && month <= 6) return sum + (Number(item["누적매출"]) || 0);
    if (month >= 7 && month <= 12) return sum + (Number(item["목표매출"]) || 0);
    return sum;
  }, 0);
  $("salesTotal").textContent = `실매출 합계 ${money(total)}`;
  $("salesForecastTotal").textContent = `4~6월 실매출 + 7~12월 목표 ${money(forecastTotal)}`;
  $("monthlyChart").innerHTML = monthlyRows
    .map((item) => {
      const value = Number(item["누적매출"]) || 0;
      const target = Number(item["목표매출"]) || 0;
      const height = Math.max((value / max) * 210, value ? 12 : 4);
      const targetHeight = Math.max((target / max) * 210, target ? 12 : 0);
      const title = target
        ? `${item["월"]} 실매출 ${money(value)} / 목표 ${money(target)}`
        : `${item["월"]} ${money(value)}`;
      return `<div class="bar ${target ? "has-target" : ""}" title="${title}">
        <div class="bar-stack">
          ${target ? `<i class="target-bar" style="height:${targetHeight}px"></i>` : ""}
          <i class="actual-bar" style="height:${height}px"></i>
        </div>
        <small class="${target ? "" : "empty-label"}">${target ? `목표 ${shortMoney(target)}` : "&nbsp;"}</small>
        <strong class="${value ? "" : "empty-label"}">${value ? shortMoney(value) : "&nbsp;"}</strong>
        <span>${item["월"]}</span>
      </div>`;
    })
    .join("");
  $("salesGrowth").innerHTML = `<div class="sales-growth-title">📊 Insight</div>
    ${[salesInsight(items, 4, 5), salesInsight(items, 5, 6)].map(renderSalesInsightCard).join("")}`;
}

function renderSalesBreakdowns(items) {
  const productTop = [...items]
    .filter((item) => annualRevenue(item) > 0)
    .sort((a, b) => annualRevenue(b) - annualRevenue(a));
  const brandRows = Object.entries(groupSum(items, "브랜드", "annualRevenue")).sort((a, b) => b[1] - a[1]);
  const monthRows = Array.from({ length: 12 }, (_, index) => {
    const key = `${index + 1}월 매출`;
    return [`${index + 1}월`, items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0)];
  }).filter((entry) => entry[1] > 0);

  const topProducts = $("topProducts");
  if (topProducts) {
    topProducts.innerHTML = productTop
      .map((item, index) => `<div class="top-row">
        <em>${index + 1}</em>
        <div>
          <strong>${item["상품명"]}</strong>
          <span>${item["브랜드"] || "-"} · ${item["런칭일"] || "런칭일 미정"}</span>
        </div>
        <b>${shortMoney(annualRevenue(item))}</b>
      </div>`)
      .join("");
  }

  $("brandSales").innerHTML = brandRows
    .map(([brand, value]) => `<div class="mini-row"><span>${brand}</span><strong>${shortMoney(value)}</strong></div>`)
    .join("");

  $("productSales").innerHTML = productTop
    .map((item) => `<div class="mini-row"><span>${item["상품명"]}</span><strong>${shortMoney(annualRevenue(item))}</strong></div>`)
    .join("");

  $("monthSales").innerHTML = monthRows.length
    ? monthRows.map(([month, value]) => `<div class="mini-row"><span>${month}</span><strong>${shortMoney(value)}</strong></div>`).join("")
    : "<div class=\"empty\">월별 상품 매출 데이터 없음</div>";
}

function renderPipeline(items) {
  const counts = groupCount(items, "개발단계");
  const entries = [
    ...stageOrder.filter((stage) => counts[stage] !== undefined).map((stage) => [stage, counts[stage]]),
    ...Object.entries(counts).filter(([stage]) => !stageOrder.includes(stage)).sort((a, b) => b[1] - a[1]),
  ];
  const max = Math.max(...entries.map((entry) => entry[1]), 1);
  $("stageCount").textContent = `${entries.length}개 단계`;
  $("pipelineBoard").innerHTML = entries
    .map(([label, count], index) => {
      const examples = items
        .filter((item) => (item["개발단계"] || "미지정") === label)
        .map((item) => `<li>${item["상품명"]}</li>`)
        .join("");
      return `<section class="pipeline-card">
        <div>
          <span style="background:${colors[index % colors.length]}"></span>
          <strong>${label}</strong>
          <em>${count}개</em>
        </div>
        <i><b style="width:${(count / max) * 100}%; background:${colors[index % colors.length]}"></b></i>
        <ul>${examples}</ul>
      </section>`;
    })
    .join("");
}

function renderCostInsight() {
  $("costInsight").innerHTML = `<div class="cost-insight-title">📊 원가 Insight</div>
    <section class="cost-insight-card">
      <div class="cost-insight-summary">
        <span>상승 환율 반영</span>
        <strong>수입원가 상승 반영</strong>
        <em>5월 대비 6월 환율 기준</em>
      </div>
      <div class="cost-insight-list">
        <h3>관리 포인트</h3>
        <p>5월 환율 대비 6월 환율 상승폭을 적용한 수입원가 변동분이 원가율에 반영되었습니다.</p>
      </div>
    </section>
    <section class="cost-insight-card">
      <div class="cost-insight-summary">
        <span>실제 판매단가 적용</span>
        <strong>원가율 변동 반영</strong>
        <em>런칭 완료 품목 기준</em>
      </div>
      <div class="cost-insight-list">
        <h3>관리 포인트</h3>
        <p>실제 런칭된 제품은 실제 판매단가를 적용하여 원가율이 변동된 부분을 함께 확인해야 합니다.</p>
      </div>
    </section>`;
}

function renderCostBands(items) {
  const bands = [
    { label: "40% 미만", caption: "우수", min: 0, max: 0.4, color: "#18a999" },
    { label: "40~50%", caption: "적정", min: 0.4, max: 0.5, color: "#316bff" },
    { label: "50~55%", caption: "주의", min: 0.5, max: 0.55, color: "#f0a500" },
    { label: "55% 이상", caption: "고위험", min: 0.55, max: Infinity, color: "#d95d5d" },
  ];
  const valid = items.filter((item) => Number(item["원가율"]) > 0);
  const total = valid.length || 1;
  const counts = bands.map((band) => valid.filter((item) => {
    const rate = Number(item["원가율"]) || 0;
    return rate >= band.min && rate < band.max;
  }).length);
  const maxCount = Math.max(...counts, 1);

  $("costBandCount").textContent = `${valid.length}개`;
  $("costBandBoard").innerHTML = bands
    .map((band, index) => {
      const bandItems = valid
        .filter((item) => {
          const rate = Number(item["원가율"]) || 0;
          return rate >= band.min && rate < band.max;
        })
        .sort((a, b) => (Number(b["원가율"]) || 0) - (Number(a["원가율"]) || 0));
      const count = bandItems.length;
      const examples = bandItems
        .map((item) => `<li>${item["상품명"]} <b>${costPercent(item["원가율"])}</b></li>`)
        .join("");
      return `<section class="cost-band">
        <div class="cost-band-head">
          <span style="background:${band.color}"></span>
          <strong>${band.label}</strong>
          <em>${band.caption}</em>
          <b>${count}개</b>
        </div>
        <i><u style="width:${(count / maxCount) * 100}%; background:${band.color}"></u></i>
        <small>${percent((count / total) * 100)}</small>
        <ul>${examples || "<li>해당 상품 없음</li>"}</ul>
      </section>`;
    })
    .join("");
  renderCostInsight();
}

function renderOwners(items) {
  const owners = items.reduce((acc, item) => {
    const owner = item["담당자"] || "담당자 미지정";
    if (!acc[owner]) acc[owner] = [];
    acc[owner].push(item);
    return acc;
  }, {});
  const entries = Object.entries(owners).sort((a, b) => b[1].length - a[1].length);

  $("ownerCount").textContent = `${entries.length}명`;
  $("ownerBoard").innerHTML = entries
    .map(([owner, ownerItems]) => {
      const avgProgress =
        ownerItems.reduce((sum, item) => sum + (Number(item["진행률"]) || 0), 0) / (ownerItems.length || 1);
      const stages = stageOrder
        .map((stage) => {
          const count = ownerItems.filter((item) => item["개발단계"] === stage).length;
          return count ? `<span>${stage} ${count}</span>` : "";
        })
        .join("");
      const itemList = ownerItems
        .sort((a, b) => (Number(b["진행률"]) || 0) - (Number(a["진행률"]) || 0))
        .map((item) => `<li><strong>${item["상품명"]}</strong><em>${item["개발단계"] || "-"} · ${percent(item["진행률"])}</em></li>`)
        .join("");

      return `<section class="owner-card">
        <div class="owner-head">
          <div>
            <strong>${owner}</strong>
            <span>담당 품목 ${ownerItems.length}개</span>
          </div>
          <b>${percent(avgProgress)}</b>
        </div>
        <div class="owner-progress"><i style="width:${Math.min(avgProgress, 100)}%"></i></div>
        <div class="owner-stages">${stages || "<span>단계 없음</span>"}</div>
        <ul>${itemList}</ul>
      </section>`;
    })
    .join("");
}

function renderSchedules(items) {
  const nowMonth = new Date().getMonth() + 1;
  const launchThisMonth = items
    .filter((item) => item["개발단계"] !== "런칭" && isCurrentMonthOrSoon(item["런칭일"]))
    .sort((a, b) => String(a["런칭일"]).localeCompare(String(b["런칭일"])));
  const productionThisMonth = items
    .filter((item) => item["개발단계"] !== "런칭" && isCurrentMonthOrSoon(item["예상입고일"]))
    .sort((a, b) => String(a["예상입고일"]).localeCompare(String(b["예상입고일"])));
  const reports = [
    {
      title: "런칭 예정",
      count: launchThisMonth.length,
      tone: "blue",
      rows: launchThisMonth.map((item) => `${item["런칭일"]} 런칭 · ${item["상품명"]}`),
    },
    {
      title: "양산/입고 예정",
      count: productionThisMonth.length,
      tone: "teal",
      rows: productionThisMonth.map((item) => `${item["예상입고일"]} · ${item["상품명"]}`),
    },
  ];

  $("monthReport").innerHTML = reports
    .map((report) => `<section class="report-card ${report.tone}">
      <div>
        <strong>${report.title}</strong>
        <span>${report.count}건</span>
      </div>
      <ul>${report.rows.length ? report.rows.map((row) => `<li>${row}</li>`).join("") : "<li>해당 사항 없음</li>"}</ul>
    </section>`)
    .join("");

  const launchItems = sortByDate(
    items.filter((item) => item["개발단계"] !== "런칭" && (item["런칭일"] || item["예상입고일"])),
    "런칭일"
  );

  const grouped = launchItems.reduce((acc, item) => {
    const basisDate = item["런칭일"] || item["예상입고일"] || "";
    const month = dateMonth(basisDate) || "일정 미정";
    if (!acc[month]) acc[month] = [];
    acc[month].push(item);
    return acc;
  }, {});

  $("launchList").innerHTML = Object.entries(grouped).length
    ? Object.entries(grouped)
        .map(([month, monthItems]) => `<section class="calendar-month">
          <h3>${month} <span>${monthItems.length}개</span></h3>
          <div>
            ${monthItems
              .map((item) => `<div class="schedule-row">
                <time>${item["런칭일"] || item["예상입고일"] || "-"}</time>
                <div><strong>${item["상품명"]}</strong><span>${item["개발단계"] || "-"} · 양산/입고 ${item["예상입고일"] || "-"} · 인증 ${item["인증상태"] || "-"}</span></div>
              </div>`)
              .join("")}
          </div>
        </section>`)
        .join("")
    : "<div class=\"empty\">런칭 예정 상품 없음</div>";
}

function renderProgressTable(items) {
  $("tableCount").textContent = `${numberFmt.format(items.length)}개`;
  $("productTable").innerHTML = items
    .map((item) => {
      const progress = Number(item["진행률"]) || 0;
      return `<tr>
        <td>${item["브랜드"] || "-"}</td>
        <td>${item["상품명"] || "-"}</td>
        <td>${item["담당자"] || "-"}</td>
        <td><span class="tag">${item["개발단계"] || "-"}</span></td>
        <td>
          <div class="progress"><i style="width:${Math.min(progress, 100)}%"></i></div>
          ${percent(progress)}
        </td>
        <td>${item["인증상태"] || "-"}</td>
        <td>${item["예상입고일"] || "-"}</td>
        <td>${item["런칭일"] || "-"}</td>
        <td class="num">${money(annualRevenue(item))}</td>
        <td class="num">${Number(item["원가율"]) ? costPercent(item["원가율"]) : "-"}</td>
      </tr>`;
    })
    .join("");
}

function render() {
  const items = currentItems();
  $("updatedAt").textContent = `Google Sheets 기준 · ${loadedAt}`;
  renderSidebar(items);
  renderKpis(items);
  renderMonthlySales(items);
  renderSalesBreakdowns(items);
  renderPipeline(items);
  renderCostBands(items);
  renderOwners(items);
  renderSchedules(items);
  renderProgressTable(items);
}

function resetFilters() {
  state.brand = "전체";
  state.month = "전체";
  state.query = "";
  $("brandFilter").value = "전체";
  $("monthFilter").value = "전체";
  $("searchInput").value = "";
  render();
}

function bind() {
  $("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const id = $("loginId").value.trim();
    const password = $("loginPassword").value;
    if (id === credentials.id && password === credentials.password) {
      $("loginHint").textContent = "로그인되었습니다.";
      auth(true);
      return;
    }
    $("loginHint").textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
  });

  $("logoutButton").addEventListener("click", () => {
    auth(false);
    $("loginPassword").value = "";
  });

  $("brandFilter").addEventListener("change", (event) => {
    state.brand = event.target.value;
    render();
  });
  $("monthFilter").addEventListener("change", (event) => {
    state.month = event.target.value;
    render();
  });
  $("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });
  $("resetFilters").addEventListener("click", resetFilters);
  $("refreshData").addEventListener("click", init);

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const target = document.getElementById(button.dataset.target);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

async function init() {
  await loadLiveData();
  renderOptions();
  resetFilters();
}

bind();
auth(localStorage.getItem("ggumbi-dashboard-auth") === "true");
init();
