## Turnin
Turnin was made to grade programming assignments written in c++.

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
| bn-bhs-005 | BN Media | Beauharnois, Quebec | 005     | 2         |
| bn-shs-001 | BN Media | Vancouver, BC       | 001     | 2         |
| bn-shs-002 | BN Media | Vancouver, BC       | 002     | 0         |

