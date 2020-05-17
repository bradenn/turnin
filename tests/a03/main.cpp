#include <iostream>

using namespace std;

int main(int argc, char **argv){
int a = 0;
while(cin >> a){
cout << "Hello, World! " << a << endl;
cerr << "Hello, World! " << a - 10 << endl;
}

for(int i = 0; i < argc; i++){
	cout << argv[i] << endl;
}

return 0;
}
