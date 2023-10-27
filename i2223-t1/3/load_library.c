#include <stdio.h>
#include <dlfcn.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
	printf("PID: %u\n", getpid());
	void * handle = dlopen("./library.so", RTLD_NOW);
	
	if(!handle) {
		fprintf(stderr, "%s\n", dlerror());
        exit(EXIT_FAILURE);
    }
	
	getchar();
	
	dlclose(handle);
}
