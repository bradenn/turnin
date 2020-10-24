## Turnin
Turnin was made to grade programming assignments written in C++.

#### SECURITY NOTICE
Patched Session Jacking vulnerability, ensure use of the latest version

Damage: If two users create a session within 1 event-loop cycle of eachother, their sessions may swap. This could show the wrong assignments or wrong class to the user. Upon redirecting or interacting, the system would have detected and reset the session.

### Uploading Tests:

Turnin records program outputs by using output redirection. The workers run the program and redirect a test input
in the form of (testName.in) to the program.


#### File Naming Scheme

| Filename      | Description                                                                     |
|---------------|---------------------------------------------------------------------------------|
| testName.in   | Each line is an input to the program                                            |
| testName.out  | Each line mirrors the program's stdout                                          |
| testName.err  | Each line mirrors the program's stderr                                          |
| testName.exit | Number on first line determines desired program exit code                       |
| testName.cmd  | All lines are joined into a space delimited string and use as command arguments |
| testName.hide | Works like a .in but the test results are not shown to student                  |

#### Bulk Uploading
You can put all of your tests in a folder aptly named "tests", compressed into a .tar (or .tgz - wip) file.
Here is an example file structure:
```
project1_tests.tar
└── project1_tests
    └── tests
        ├── t01.cmd
        ├── t01.err
        ├── t01.exit
        ├── t01.in
        └── t01.out
```

### Server Naming Conventions
Web app https://turnin.bradenn.com
```
API Load Balance:
Entry: tw.bradenn.com

Template:
OO-LLL-CCC

O: Organization
L: Location
C: Cluster

Example:
bn-bhs-005
Cluster 005 at Beauharnois, Quebec managed by BN Media
```

### Clusters:

| Server     | Manager  | Location            | Cluster | Instances |
|------------|----------|---------------------|---------|-----------|
| bn-bhs-005 | BN Media | Beauharnois, Quebec | 005     | 4         |
| bn-shs-001 | BN Media | Vancouver, BC       | 001     | 8         |
| bn-shs-002 | BN Media | Vancouver, BC       | 002     | 8         |
|            |
| Total Instances  |    |                     |         | 20        |
