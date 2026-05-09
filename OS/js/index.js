let processes = [];

{A:[{},{}]}

const SCENARIOS = {
  A: [
    { pid: "P1", at: 0, bt: 8, pr: 3 },
    { pid: "P2", at: 1, bt: 4, pr: 1 },
    { pid: "P3", at: 2, bt: 9, pr: 2 },
    { pid: "P4", at: 3, bt: 5, pr: 4 },
    { pid: "P5", at: 4, bt: 2, pr: 2 },
  ],
  B: [
    { pid: "P1", at: 0, bt: 12, pr: 1 }, // high priority, long
    { pid: "P2", at: 1, bt: 2, pr: 4 }, // low priority, short
    { pid: "P3", at: 2, bt: 4, pr: 3 },
    { pid: "P4", at: 3, bt: 6, pr: 2 },
  ],
  C: [
    { pid: "P1", at: 0, bt: 3, pr: 1 },
    { pid: "P2", at: 0, bt: 3, pr: 1 },
    { pid: "P3", at: 0, bt: 3, pr: 1 },
    { pid: "P4", at: 0, bt: 5, pr: 4 }, // starvation candidate
  ],
  D: null, // validation scenario
};

function showError(msg) {
  const el = document.getElementById("error-msg");
  el.textContent = msg;
  el.classList.add("show");
}

function clearError() {
  document.getElementById("error-msg").classList.remove("show");
}

function addProcess() {
  clearError();
  const pidRaw = document.getElementById("pid").value.trim();
  const atRaw = document.getElementById("at").value.trim();
  const btRaw = document.getElementById("bt").value.trim();
  const prRaw = document.getElementById("pr").value.trim();

  if (!pidRaw) return showError("Process ID cannot be empty.");
  if (processes.find((p) => p.pid === pidRaw))
    return showError(
      `Duplicate Process ID "${pidRaw}". Each process must have a unique ID.`
    );
  if (atRaw === "") return showError("Arrival Time is required.");
  if (btRaw === "") return showError("Burst Time is required.");
  if (prRaw === "") return showError("Priority is required.");

  const at = Number(atRaw),
    bt = Number(btRaw),
    pr = Number(prRaw);

  if (at < 0) return showError("Arrival Time cannot be negative.");
  if (bt <= 0) return showError("Burst Time must be greater than 0.");
  if (pr <= 0) return showError("Priority must be greater than 0.");

  processes.push({ pid: pidRaw, at, bt, pr });
  renderTable();

  ["pid", "at", "bt", "pr"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
}

function renderTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = processes
    .map(
      (p, i) => `
    <tr>
      <td>${p.pid}</td>
      <td>${p.at}</td>
      <td>${p.bt}</td>
      <td>${p.pr}</td>
      <td><button class="remove-btn" onclick="removeProcess(${i})">delete</button></td>
    </tr>
  `,
    )
    .join(""); 
}

function removeProcess(index) {
  processes.splice(index, 1);
  renderTable();
}

function clearAll() {
  processes = [];
  renderTable();
  document.getElementById("results-section").classList.remove("show");
  document.getElementById("pid").value = "";
  document.getElementById("at").value = ""; 
  document.getElementById("bt").value = ""; 
  document.getElementById("pr").value = "";
  clearError();
}

function loadScenario(key) {
  clearError();
  if (key === "D") {
    processes = [];
    renderTable();
    document.getElementById("pid").value = "P1";
    document.getElementById("at").value = "-2"; // invalid
    document.getElementById("bt").value = "0"; // invalid
    document.getElementById("pr").value = ""; // missing
    return;
  }
  processes = SCENARIOS[key].map((p) => ({ ...p }));
  renderTable();
  document.getElementById("results-section").classList.remove("show");
}


function runPriority(procs) {   
  const n = procs.length;  
  const remaining = procs.map((p) => p.bt);  
  const firstRun = new Array(n).fill(false); 
  const finish = new Array(n).fill(0);      
  const rt = new Array(n).fill(0);   

  let time = 0,   
    completed = 0; 
  const gantt = [];  
  let current = -1, 
    segStart = 0;   

  while (completed < n) {

    let best = -1;

    for (let i = 0; i < n; i++) {
      if (procs[i].at <= time && remaining[i] > 0) {
        if (best === -1) {
          best = i;
          continue;
        }
        if (procs[i].pr < procs[best].pr) best = i
        else if (procs[i].pr === procs[best].pr) {
          if (procs[i].at < procs[best].at) best = i;  
          else if (procs[i].at === procs[best].at && i < best) best = i; 
        }
      }
    }

    if (best === -1) {
      const nextArrival = Math.min(                                  
        ...procs.map((p, i) => (remaining[i] > 0 ? p.at : Infinity)),  
      );

      time = nextArrival;
      current = -1;
      segStart = time;
      continue;
    }

    if (best !== current) {
      if (current !== -1 && segStart < time) {
        gantt.push({
          pid: procs[current].pid,
          start: segStart,
          end: time,
        });
      }
      current = best;
      segStart = time;
    }

    if (!firstRun[best]) {
      rt[best] = time - procs[best].at;
      firstRun[best] = true;
    }

    remaining[best]--;
    time++;

    if (remaining[best] === 0) {
      finish[best] = time;
      completed++;
      gantt.push({ pid: procs[best].pid, start: segStart, end: time });
      current = -1;
      segStart = time;
    }
  }

  const tat = procs.map((p, i) => finish[i] - p.at);
  const wt = procs.map((p, i) => tat[i] - p.bt);
  return {
    gantt: mergeGantt(gantt),
    metrics: procs.map((p, i) => ({
      pid: p.pid,
      at: p.at,
      bt: p.bt,
      pr: p.pr,
      ft: finish[i],
      tat: tat[i],
      wt: wt[i],
      rt: rt[i],
    })),
  }
}

function runSRTF(procs) {
  const n = procs.length;
  const remaining = procs.map((p) => p.bt);
  const firstRun = new Array(n).fill(false);
  const finish = new Array(n).fill(0);
  const rt = new Array(n).fill(0);

  let time = 0,
    completed = 0;
  const gantt = [];
  let current = -1,
    segStart = 0;

  while (completed < n) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (procs[i].at <= time && remaining[i] > 0) {      
        if (best === -1) {
          best = i;
          continue;
        }
        if (remaining[i] < remaining[best]) best = i;
        else if (remaining[i] === remaining[best]) {
          if (procs[i].at < procs[best].at) best = i;
          else if (procs[i].at === procs[best].at && i < best) best = i;
        }
      }
    }

    if (best === -1) {
      const nextArrival = Math.min(
        ...procs.map((p, i) => (remaining[i] > 0 ? p.at : Infinity)),
      );

      time = nextArrival;
      current = -1;
      segStart = time;
      continue;
    }

    if (best !== current) {
      if (current !== -1 && segStart < time) {
        gantt.push({
          pid: procs[current].pid,
          start: segStart,
          end: time,
        });
      }
      current = best;
      segStart = time;
    }

    if (!firstRun[best]) {
      rt[best] = time - procs[best].at;
      firstRun[best] = true;
    }
    remaining[best]--;
    time++;

    if (remaining[best] === 0) {
      finish[best] = time;
      completed++;
      gantt.push({ pid: procs[best].pid, start: segStart, end: time });
      current = -1;
      segStart = time;
    }
  }

  const tat = procs.map((p, i) => finish[i] - p.at);
  const wt = procs.map((p, i) => tat[i] - p.bt);
  return {
    gantt: mergeGantt(gantt),
    metrics: procs.map((p, i) => ({
      pid: p.pid,
      at: p.at,
      bt: p.bt,
      pr: p.pr,
      ft: finish[i],
      tat: tat[i],
      wt: wt[i],
      rt: rt[i],
    })),
  };
}

function mergeGantt(gantt) {
  if (!gantt.length) return [];
  const merged = [{ ...gantt[0] }];
  for (let i = 1; i < gantt.length; i++) {
    const last = merged[merged.length - 1];
    if (gantt[i].pid === last.pid && gantt[i].start === last.end) {
      last.end = gantt[i].end;
    } else {
      merged.push({ ...gantt[i] });
    }
  }
  return merged;
}

function renderGantt(gantt, containerId) {
  const container = document.getElementById(containerId);
  if (!gantt.length) {
    return;
  }

  const totalTime = gantt[gantt.length - 1].end;
  const scale = Math.min(48, Math.max(20, Math.floor(800 / totalTime)));
  const offset = gantt[0].start;

  let rowHTML = "";
  let timesHTML = "";
  const shownTimes = new Set();

  gantt.forEach((seg) => {
    const width = (seg.end - seg.start) * scale;

    rowHTML += `
      <div class="gantt-block" style="width:${width}px;">
        ${seg.pid}                                                    
       </div>`;

    if (!shownTimes.has(seg.start)) {
      timesHTML += `<span style="position:absolute;left:${(seg.start - offset) * scale}px;">${seg.start}</span>`;
      shownTimes.add(seg.start);
    }
  });
  const last = gantt[gantt.length - 1];
  if (!shownTimes.has(last.end)) {
    timesHTML += `<span style="position:absolute;left:${(last.end - offset) * scale}px;">${last.end}</span>`;
  }

  container.innerHTML = `
    <div class="gantt-row">${rowHTML}</div>
    <div class="gantt-times">${timesHTML}</div>
  `;
}

function renderResultsTable(metrics, tableId, classId) {
  const avgWT = (
    metrics.reduce((s, m) => s + m.wt, 0) / metrics.length
  ).toFixed(2);
  const avgTAT = (
    metrics.reduce((s, m) => s + m.tat, 0) / metrics.length
  ).toFixed(2);
  const avgRT = (
    metrics.reduce((s, m) => s + m.rt, 0) / metrics.length
  ).toFixed(2);

  const table = document.getElementById(tableId);
  table.innerHTML = `
    <thead>
      <tr>
        <th>PID</th><th>AT</th><th>BT</th><th>PR</th><th>FT</th><th>TAT</th><th>WT</th><th>RT</th>
      </tr>
    </thead>
    <tbody>
      ${metrics
        .map(
          (m) => `
        <tr>
          <td>${m.pid}</td>
          <td>${m.at}</td><td>${m.bt}</td><td>${m.pr}</td><td>${m.ft}</td>
          <td>${m.tat}</td><td>${m.wt}</td><td>${m.rt}</td>
        </tr>
      `,
        )
        .join("")}
      <tr class="avg-row">
        <td class="${classId}" colspan="5" style="font-family:'Space Mono',monospace;font-size:11px;">AVERAGES</td>
        <td class="${classId}">${avgTAT}</td>
        <td class="${classId}">${avgWT}</td>
        <td class="${classId}">${avgRT}</td>
      </tr>
    </tbody>
  `;
  return {
    avgWT: parseFloat(avgWT),
    avgTAT: parseFloat(avgTAT),
    avgRT: parseFloat(avgRT),
  };
}

function renderComparison(pAvg, sAvg, procs) {
  const metrics = [
    { label: "Avg Waiting Time", pVal: pAvg.avgWT, sVal: sAvg.avgWT },
    { label: "Avg Turnaround Time", pVal: pAvg.avgTAT, sVal: sAvg.avgTAT },
    { label: "Avg Response Time", pVal: pAvg.avgRT, sVal: sAvg.avgRT },
  ];

  const grid = document.getElementById("compare-grid");
  grid.innerHTML = metrics
    .map((m) => {
      let winnerName, winnerClass, detail;
      if (m.pVal < m.sVal) {
        winnerName = "Priority";
        winnerClass = "p1";
      } else if (m.sVal < m.pVal) {
        winnerName = "SRTF";
        winnerClass = "s1";
      } else {
        winnerName = "TIE";
        winnerClass = ".tie";
      }
      return `
      <div class="compare-card">
        <div class="metric">${m.label}</div>
        <div class="winner ${winnerClass}">${winnerName}</div>
        <div class="vals">Priority: ${m.pVal} &nbsp;|&nbsp; SRTF: ${m.sVal}</div>
      </div>
    `;
    })
    .join("");
}

function renderConclusion(pAvg, sAvg) {
  const box = document.getElementById("conclusion-box");

  function getWinner(pVal, sVal) {
    if (pVal < sVal) return "Priority Scheduling";
    if (sVal < pVal) return "SRTF";
    return "Tie";
  }

  const wtWinner = getWinner(pAvg.avgWT, sAvg.avgWT);
  const tatWinner = getWinner(pAvg.avgTAT, sAvg.avgTAT);
  const rtWinner = getWinner(pAvg.avgRT, sAvg.avgRT);

  const pSum = pAvg.avgWT + pAvg.avgTAT + pAvg.avgRT;
  const sSum = sAvg.avgWT + sAvg.avgTAT + sAvg.avgRT;
  const overall = getWinner(pSum, sSum);

  const overallText =
    overall === "Tie"
      ? "Both algorithms performed equally on this dataset across all three metrics."
      : `${overall} achieved a lower combined average across all three metrics.`;

  const wtText =
    wtWinner === "Tie"
      ? `Both algorithms tied on average waiting time (${pAvg.avgWT}).`
      : `${wtWinner} produced a lower average WT (Priority: ${pAvg.avgWT} | SRTF: ${sAvg.avgWT}).`;

  const tatText =
    tatWinner === "Tie"
      ? `Both algorithms tied on average turnaround time (${pAvg.avgTAT}).`
      : `${tatWinner} produced a lower average TAT (Priority: ${pAvg.avgTAT} | SRTF: ${sAvg.avgTAT}).`;

  const rtText =
    rtWinner === "Tie"
      ? `Both algorithms tied on average response time (${pAvg.avgRT}).`
      : `${rtWinner} produced a lower average RT (Priority: ${pAvg.avgRT} | SRTF: ${sAvg.avgRT}).`;

  const winners = [wtWinner, tatWinner, rtWinner];

  const priorityWins = winners.filter(
    (w) => w === "Priority Scheduling",
  ).length;
  const srtfWins = winners.filter((w) => w === "SRTF").length;

  let tradeoffText;
  if (priorityWins === 3) {
    tradeoffText =
      "Priority Scheduling dominated all metrics on this workload, suggesting the processes had urgency requirements that aligned well with priority-based service.";
  } else if (srtfWins === 3) {
    tradeoffText =
      "SRTF dominated all metrics on this workload, suggesting the processes were short enough that preempting for shortest remaining time was consistently more efficient than serving by priority.";
  } else if (priorityWins > srtfWins) {
    tradeoffText =
      "Priority Scheduling had an edge on this workload. While SRTF was more efficient for shorter jobs, priority-based ordering produced better overall results here.";
  } else if (srtfWins > priorityWins) {
    tradeoffText =
      "SRTF had an edge on this workload. While Priority Scheduling protected urgent processes, SRTF's preemptive shortest-remaining-time approach was more efficient overall.";
  } else {
    tradeoffText =
      "Both algorithms traded wins across metrics. Priority Scheduling protected urgent processes while SRTF favored shorter jobs — neither was clearly superior on this workload.";
  }

  let recommendText;
  if (overall === "Priority Scheduling") {
    recommendText =
      "For this workload, Priority Scheduling is recommended. It served urgent processes faster while still producing competitive overall metrics.";
  } else if (overall === "SRTF") {
    recommendText =
      "For this workload, SRTF is recommended. It consistently produced lower waiting, turnaround, and response times, making it the more efficient choice here.";
  } else {
    recommendText =
      "Neither algorithm has a clear overall advantage on this workload. The choice should depend on the nature of the processes — use Priority Scheduling if urgency matters, SRTF if efficiency matters.";
  }

  box.innerHTML = `
    <p><strong>Overall:</strong> ${overallText}</p>
    <p><strong>Waiting Time:</strong> ${wtText}</p>
    <p><strong>Turnaround Time:</strong> ${tatText}</p>
    <p><strong>Response Time:</strong> ${rtText}</p>
    <p><strong>Main trade-off observed:</strong> ${tradeoffText}</p>
    <p><strong>Recommendation:</strong> ${recommendText}</p>
    <p><strong>Fairness:</strong> Neither algorithm is fully fair. Priority risks starvation for low-priority processes. SRTF risks starvation for long processes.</p>
  `;
}

function runSimulation() {
  clearError();
  if (processes.length < 2) {
    return showError(
      "Please add at least 2 processes before running the simulation.",
    );
  }

  const prResult = runPriority(processes);
  const srResult = runSRTF(processes);

  renderGantt(prResult.gantt, "gantt-priority");
  renderGantt(srResult.gantt, "gantt-srtf");

  const pAvg = renderResultsTable(prResult.metrics, "results-priority", "p1");
  const sAvg = renderResultsTable(srResult.metrics, "results-srtf", "s1");

  renderComparison(pAvg, sAvg, processes);
  renderConclusion(pAvg, sAvg);

  const section = document.getElementById("results-section");
  section.classList.add("show");
}
