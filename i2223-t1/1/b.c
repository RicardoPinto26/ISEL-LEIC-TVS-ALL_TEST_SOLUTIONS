#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <fcntl.h>

int main() {
    int pipefd[2];

    if (pipe(pipefd) == -1) {
        perror("pipe");
        exit(EXIT_FAILURE);
    }
	pid_t pid1;
    if ((pid1 = fork()) == -1) {
        perror("fork");
        exit(EXIT_FAILURE);
    }

    if (pid1 == 0) { // Child
        close(pipefd[0]);

        dup2(pipefd[1], STDOUT_FILENO);
        close(pipefd[1]);

        char *args[] = {"./ex1", "18", NULL};
        execvp(args[0], args);
        perror("execvp");
        exit(EXIT_FAILURE);
    } else { //Parent
    	pid_t pid2;
        if ((pid2 = fork()) == -1) {
            perror("fork");
            exit(EXIT_FAILURE);
        }

        if (pid2 == 0) { // Child
            close(pipefd[1]);

            dup2(pipefd[0], STDIN_FILENO);
            close(pipefd[0]);

            int out = open("output1.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
            if (out == -1) {
                perror("open");
                exit(EXIT_FAILURE);
            }
            dup2(out, STDOUT_FILENO);
            close(out);

            char *args[] = {"grep", "1", NULL};
            execvp(args[0], args);
            perror("execvp");
            exit(EXIT_FAILURE);
        } else {
            close(pipefd[0]);
            close(pipefd[1]);
            waitpid(pid1, NULL, 0);
            waitpid(pid2, NULL, 0);
        }
    }

    return 0;
}
