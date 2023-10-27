const int BASE[] = {0,11,22,33};
int accum = 1;
int func(int idx) { accum += idx; return BASE[idx%4] + accum; }
