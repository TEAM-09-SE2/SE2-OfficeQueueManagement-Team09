TEMPLATE FOR RETROSPECTIVE (Team 09)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done: 3 stories committed vs 2 done
- Total points committed vs done: 13 points committed vs 11 points committed
- Nr of hours planned vs spent (as a team): 46 hours planned vs 48.15 hours spent

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on Git
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    6     |    -   |      27    |       28.30      |
| Get Ticket  |4    |    3     |    7    |      6.40      | 
| Next Customer  |4    |    8     |    6    |      6.45      |    
| Call Customer (not done)  |4    |    2    |    6   |      6.20      |           
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |   2.56   |   2.81   | 
| Actual     |   2.68   |    2.76   |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = \frac{48.25}{46} - 1 \approx 0.049 \quad (+4.9\%)$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_{task_i}}-1 \right| = \frac{4}{18} \approx 0.222 \quad (22.2\%)$$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 3 
  - Total hours spent: 3.45
  - Nr of automated unit test cases: 15
  - Coverage
- E2E testing: 
  - Total hours estimated: included in the unit test hours estimation
  - Total hours spent: included in the unit test hours spent
  - Nr of test cases: 15
- Code review 
  - Total hours estimated: 0
  - Total hours spent: not track


## ASSESSMENT

- What caused your errors in estimation (if any)?

- What lessons did you learn (both positive and negative) in this sprint?

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
- Which ones you were not able to achieve? Why?

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

> Propose one or two

- One thing you are proud of as a Team!!