#include <stdio.h>
#include <stdlib.h>

int main(int argc, char * argv[]) {
	int base = atoi(argv[1]); // converte string com dígitos para inteiro
	for (int i = 0; i < 4; ++i) printf("%d\n", base + i);
	return 0;
}
