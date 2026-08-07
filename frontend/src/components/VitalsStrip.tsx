export function VitalsStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`overflow-hidden border-y-2 border-ink bg-paper ${compact ? 'h-14' : 'h-8'}`} aria-hidden="true">
      <svg className="h-full min-w-[1520px] animate-[pulse-line_8s_linear_infinite]" viewBox="0 0 1520 56" fill="none" preserveAspectRatio="none">
        <path
          d="M0 30H28L38 30L48 16L58 44L68 30H86L96 30L106 24L116 36L126 30H148L158 30L168 12L178 48L188 30H202L212 30L222 20L232 40L242 30H260L270 30L280 26L290 34L300 30H318L328 30L338 14L348 46L358 30H376L386 30L396 22L406 38L416 30H434L444 30L454 10L464 50L474 30H492L502 30L512 18L522 42L532 30H556L566 30L576 28L586 32L596 30H618L628 30L638 15L648 45L658 30H676L686 30L696 19L706 41L716 30H760"
          stroke="var(--vital-red)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M760 30H788L798 30L808 16L818 44L828 30H846L856 30L866 24L876 36L886 30H908L918 30L928 12L938 48L948 30H962L972 30L982 20L992 40L1002 30H1020L1030 30L1040 26L1050 34L1060 30H1078L1088 30L1098 14L1108 46L1118 30H1136L1146 30L1156 22L1166 38L1176 30H1194L1204 30L1214 10L1224 50L1234 30H1252L1262 30L1272 18L1282 42L1292 30H1316L1326 30L1336 28L1346 32L1356 30H1378L1388 30L1398 15L1408 45L1418 30H1436L1446 30L1456 19L1466 41L1476 30H1520"
          stroke="var(--vital-red)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
      <style>{`
        @keyframes pulse-line {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          svg { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
