#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>

int do_cmd(const char *cmd) {
	pid_t pid = fork();
	if(pid == 0) {
		execlp("sh", "sh", "-c", cmd, (char *) NULL);
		exit(EXIT_FAILURE);
	} else {
		int res;
		waitpid(pid, &res, 0);
		
		if(WIFEXITED(res) && WEXITSTATUS(res) == EXIT_SUCCESS) {
			return 0;
		}
		
		return -1;
	}
}

int main() {
	int result = do_cmd("ls *.c | grep test | wc -l > out.txt");
}
