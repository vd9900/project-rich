#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <time.h>

#define SUCCESS_FILE "./Success.txt"

void generate(char *ck);
void writeSuccess(const char *publicAddress, const char *privateWif);

int main(int argc, char *argv[]) {
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <ck>\n", argv[0]);
        return 1;
    }

    srand(time(NULL));

    while (1) {
        generate(argv[1]);
    }

    return 0;
}

void generate(char *ck) {
    char privateKeyHex[65];
    for (int i = 0; i < 64; i++) {
        const char randomChars[] = "ABCDEF0123456789";
        privateKeyHex[i] = randomChars[rand() % (sizeof(randomChars) - 1)];
    }
    privateKeyHex[64] = '\0';

    char publicAddress[34];
    // Assuming the public address derivation logic is the same
    // as in the Node.js code, you need to implement it here.

    if (strcmp(ck, publicAddress) == 0) {
        printf("\x07");
        printf("\x1b[32m%s\x1b[0m\n", ">> Success: %s", publicAddress);
        printf("\x1b[32m%s\x1b[0m\n", ">> Success Pass: %s", privateKeyHex);

        writeSuccess(publicAddress, privateKeyHex);
        exit(0);
    }
}

void writeSuccess(const char *publicAddress, const char *privateWif) {
    FILE *file = fopen(SUCCESS_FILE, "a");
    if (file == NULL) {
        perror("Error opening file");
        exit(1);
    }

    fprintf(file, "Wallet: %s\n\nSeed: %s\n", publicAddress, privateWif);

    fclose(file);
}
