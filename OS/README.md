# Priority vs SRTF Comparison Project

# Algorithms
-Priority Scheduling
-SRTF

## Project Description

This project simulates CPU Scheduling algorithms including Priority Scheduling and SRTF (Shortest Remaining Time First).

The system allows users to enter processes with their arrival time, burst time, and priority, then calculates:
- Waiting Time
- Turnaround Time
- Execution Order

The project also includes:
- Input validation
- Gantt Chart visualization

## Scenarios
### Scenario 1 - Basic Mixed
This scenario demonstrates a mixed set of processes with different arrival times, burst times, and priorities to test the behavior of both SRTF and Priority Scheduling algorithms.

### Step 1 — Load Scenario
![Load Scenario](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/basic-mixed-1.png)

### Step 2 — Gantt Chart
![Gantt Chart](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/basic-mixed-2.png)

### Step 3 — Scheduling Result
![Scheduling Result](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/basic-mixed-3.png)

### Step 4 — Comprasion Summary && Final Conclusion 
![Comprasion Summary && Final Conclusion](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/basic-mixed-4.png)

### Scenario 2 - Priority vs. Burst Conflict
This scenario contains 4 processes designed to create a direct conflict between priority levels and burst times across both scheduling algorithms.

### Step 1 — Load Scenario
![Load Scenario](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/priority-vs-burst-conflict-1.png)

### Step 2 — Gantt Chart
![Gantt Chart](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/priority-vs-burst-conflict-2.png)

### Step 3 — Scheduling Result
![Scheduling Result](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/priority-vs-burst-conflict-3.png)

### Step 4 — Comprasion Summary && Final Conclusion 
![Comprasion Summary && Final Conclusion](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/priority-vs-burst-conflict-4.png)

### Scenario 3 - Starvation Risk 
This scenario contains 4 processes where three of them share the same priority, designed to show how a low-priority process can be starved and never get CPU time.

### Step 1 — Load Scenario
![Load Scenario](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/starvation-risk-1.png)


### Step 2 — Gantt Chart
![Gantt Chart](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/starvation-risk-2.png)

### Step 3 — Scheduling Result
![Scheduling Result](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/starvation-risk-3.png)

### Step 4 — Comprasion Summary && Final Conclusion 
![Comprasion Summary && Final Conclusion](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/starvation-risk-4.png)

### Validation Test
#  Missing Required Field
![ Missing Required Field](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/validation-test-1.png)
![ Missing Required Field](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/validation-test-4.png)


# Arrival time cannot be negative
![Arrival Time Cannot Be Negative](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/validation-test-2.png)

# Burst time must be greater than 0
![Burst Time Must Be Greater Than 0](https://raw.githubusercontent.com/farahessam228/os-project/master/OS/screenshots/validation-test-3.png)




