#include <stdio.h>
#include <errno.h>

#if defined(WIN32) || defined(_WIN32)
#include <process.h>
#else
#include <unistd.h>
#endif

int main(int argc, char * argv[]) {
	printf("Make friends with PAPP Browser!\n"
		   "Copyright(2014-2015) by iwebpp@gmail.com. All Rights Reserved.\n\n");

#if defined(WIN32) || defined(_WIN32)
	_execl("./back/bin/windows/node.exe", "./back/bin/windows/node.exe", "./index.js", NULL);
#elif defined(__APPLE__)
	execl("./back/bin/mac/node", "./back/bin/mac/node", "./index.js", NULL);
#else
	execl("./back/bin/linux32/node", "./back/bin/linux32/node", "./index.js", NULL);
#endif

	perror("PAPP browser execute failed");
	printf("You can send failure info by email to iwebpp@gmail.com for support ...\n\n");

	return -1;
}
