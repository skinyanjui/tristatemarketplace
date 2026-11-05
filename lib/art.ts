// Original flat illustrations, one per category. Solid colors only, no gradients.
export function art(kind: string, bg: string, M: string, variant = ""): string {
    const K = '#1c1c1e', W = '#ffffff', Y = '#ffd60a';
    const r = (x: number, y: number, w: number, h: number, f: string, rx?: number, o?: number) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '" fill="' + f + '"' + (o ? ' opacity="' + o + '"' : '') + '/>';
    const c = (x: number, y: number, rad: number, f: string, o?: number) => '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="' + f + '"' + (o ? ' opacity="' + o + '"' : '') + '/>';
    const p = (d: string, f: string, o?: number) => '<path d="' + d + '" fill="' + f + '"' + (o ? ' opacity="' + o + '"' : '') + '/>';
    const e = (x: number, y: number, rx: number, ry: number, f: string, rot?: number) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (rot ? ' transform="rotate(' + rot + ' ' + x + ' ' + y + ')"' : '') + '/>';
    const l = (d: string, col: string, w: number) => '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>';
    const ground = r(0, 150, 200, 50, '#000000', 0, 0.07);
    const wheel = (x: number, y: number, rad: number) => c(x, y, rad, K) + c(x, y, rad * 0.45, W);
    let s = ground;
    switch (kind) {
      case 'car':
        if (variant === 'truck') {
          s += p('M24 140 V104 H96 V92 L110 78 H140 L156 98 H178 Q184 98 184 106 V140 Z', M) + p('M114 84 H138 L150 98 H110 Z', W, 0.85) + wheel(58, 142, 16) + wheel(150, 142, 16);
        } else {
          s += p('M30 140 V118 Q30 110 40 108 L68 104 L84 84 Q88 80 94 80 H128 Q134 80 138 85 L152 104 L168 108 Q176 110 176 118 V140 Z', M) + p('M90 88 H126 L140 104 H78 Z', W, 0.85) + wheel(62, 142, 16) + wheel(146, 142, 16);
        }
        break;
      case 'home':
        s += p('M38 94 L100 42 L162 94 Z', K) + r(54, 92, 92, 58, M) + r(92, 112, 22, 38, K, 2) + r(64, 104, 20, 18, W, 2) + r(120, 104, 20, 18, W, 2) + r(128, 50, 12, 24, K);
        break;
      case 'sale':
        s += p('M24 86 L100 46 L176 86 Z', K) + r(30, 82, 140, 68, M) + r(60, 104, 80, 46, K) + r(70, 122, 26, 28, W, 2) + r(100, 130, 30, 20, W, 2) + r(138, 96, 44, 24, W, 3) + r(144, 102, 32, 3, K) + r(144, 109, 20, 3, K) + r(158, 120, 4, 30, K);
        break;
      case 'event':
        s += l('M16 54 Q100 100 184 54', K, 2);
        ([[41, 66, M], [66, 73, W], [100, 77, M], [134, 73, W], [159, 66, M]] as [number, number, string][]).forEach((f) => { s += p('M' + (f[0] - 8) + ' ' + f[1] + ' L' + (f[0] + 8) + ' ' + f[1] + ' L' + f[0] + ' ' + (f[1] + 18) + ' Z', f[2]); });
        s += r(40, 116, 120, 8, M, 2) + r(46, 124, 108, 26, K) + c(100, 100, 8, W) + r(94, 106, 12, 10, W, 3);
        break;
      case 'land':
        s += c(150, 56, 16, W) + p('M0 150 Q50 100 110 126 T200 112 V200 H0 Z', M) + p('M0 172 Q70 132 200 162 V200 H0 Z', K, 0.22);
        for (let i = 0; i < 5; i++) { s += r(30 + i * 22, 126, 4, 24, K); }
        s += r(26, 134, 92, 3, K);
        break;
      case 'livestock':
        if (variant === 'goat') {
          s += r(58, 100, 80, 36, '#f5f5f5', 16) + r(132, 80, 28, 32, '#f5f5f5', 10) + p('M140 82 L136 60 L148 80 Z', K) + p('M154 82 L162 62 L158 84 Z', K) + p('M152 108 l6 14 l-10 -6 z', K) + c(146, 92, 2.5, K) + r(66, 132, 6, 22, K) + r(80, 132, 6, 22, K) + r(116, 132, 6, 22, K) + r(128, 132, 6, 22, K) + r(52, 104, 8, 4, K, 2) + r(92, 108, 12, 12, M, 6);
        } else {
          s += r(54, 90, 96, 46, '#f5f5f5', 18) + c(82, 108, 10, K) + c(122, 104, 12, K) + r(140, 74, 36, 36, '#f5f5f5', 10) + r(152, 96, 24, 14, M, 5) + p('M140 80 L126 74 L134 88 Z', M) + c(154, 88, 2.5, K) + r(64, 130, 8, 24, K) + r(82, 130, 8, 24, K) + r(120, 130, 8, 24, K) + r(138, 130, 8, 24, K) + r(48, 96, 4, 34, K, 2);
        }
        break;
      case 'moto':
        s += wheel(56, 130, 22) + wheel(148, 130, 22) + p('M56 130 L84 98 H122 L148 130 H130 L112 110 H94 L74 130 Z', M) + r(88, 82, 34, 18, M, 8) + r(60, 92, 30, 8, K, 4) + p('M132 98 L142 78 H154 L148 86 L142 100 Z', K) + r(74, 124, 40, 6, K, 3);
        break;
      case 'boat':
        s += r(0, 146, 200, 54, M, 0, 0.35) + p('M64 52 V112 H112 Z', W) + r(60, 50, 4, 66, K) + r(88, 96, 52, 20, W, 4) + r(96, 101, 36, 8, K, 2) + p('M26 116 H174 L154 146 H46 Z', M) + p('M0 154 Q12 146 24 154 T48 154 T72 154 T96 154 T120 154 T144 154 T168 154 T192 154 T216 154 V200 H0 Z', W, 0.45);
        break;
      case 'trailer':
        s += r(44, 76, 112, 66, M, 6) + r(44, 100, 112, 4, W) + r(138, 82, 2, 54, K) + p('M156 130 H186 V134 H156 Z', K) + r(172, 134, 3, 14, K) + wheel(92, 146, 16);
        break;
      case 'farm':
        s += r(104, 100, 66, 28, M, 6) + r(66, 60, 46, 62, W, 6, 0.9) + r(60, 54, 58, 8, K, 3) + r(152, 74, 5, 30, K) + wheel(72, 128, 28) + c(72, 128, 12, M) + wheel(152, 138, 16) + c(152, 138, 6, M);
        break;
      case 'furniture':
        s += r(44, 60, 112, 88, M, 6) + r(38, 52, 124, 12, K, 4);
        for (let i = 0; i < 3; i++) { for (let j = 0; j < 2; j++) { s += r(52 + j * 50, 72 + i * 24, 46, 20, K, 3, 0.2) + c(75 + j * 50, 82 + i * 24, 3, W); } }
        s += r(52, 148, 6, 10, K) + r(142, 148, 6, 10, K);
        break;
      case 'appliance':
        s += r(62, 36, 76, 114, '#f5f5f7', 8) + r(62, 80, 76, 3, K, 0, 0.3) + r(70, 50, 4, 22, K, 2) + r(70, 92, 4, 30, K, 2) + r(98, 48, 28, 8, M, 2) + r(62, 146, 76, 4, K, 0, 0.2);
        break;
      case 'tools':
        s += r(66, 44, 68, 22, K, 4) + p('M66 48 Q46 54 38 74 L58 68 Z', K) + r(94, 64, 12, 90, '#a0673a', 3) + r(92, 104, 16, 50, M, 5);
        break;
      case 'garden':
        s += r(52, 116, 96, 16, M, 6) + r(94, 84, 36, 30, K, 6) + r(124, 68, 8, 32, K, 3) + r(76, 72, 4, 44, K, 2) + wheel(134, 138, 16) + wheel(62, 142, 10) + r(148, 112, 14, 8, K, 3);
        break;
      case 'electronics':
        s += r(36, 50, 128, 82, K, 6) + r(42, 56, 116, 70, M, 3) + p('M92 76 V106 L118 91 Z', W) + r(92, 132, 16, 14, K) + r(70, 146, 60, 6, K, 3);
        break;
      case 'sports':
        s += '<circle cx="54" cy="122" r="24" fill="none" stroke="' + K + '" stroke-width="5"/><circle cx="146" cy="122" r="24" fill="none" stroke="' + K + '" stroke-width="5"/>' + l('M54 122 L84 84 H116 L146 122 M84 84 L100 122 H54 M116 84 L100 122', M, 5) + l('M110 72 H128 M116 84 L112 72', K, 5) + r(74, 76, 20, 6, K, 3);
        break;
      case 'clothing':
        s += p('M70 48 L100 58 L130 48 L168 72 L150 98 L136 88 V150 H64 V88 L50 98 L32 72 Z', M) + p('M86 48 Q100 72 114 48 Z', bg);
        break;
      case 'kids':
        s += c(72, 64, 14, M) + c(128, 64, 14, M) + c(72, 64, 7, W) + c(128, 64, 7, W) + e(100, 136, 34, 28, M) + c(100, 84, 34, M) + c(100, 94, 14, W) + c(100, 90, 4, K) + c(88, 78, 3, K) + c(112, 78, 3, K) + c(72, 140, 8, W) + c(128, 140, 8, W);
        break;
      case 'antiques':
        s += r(64, 28, 72, 16, K, 4) + r(70, 40, 60, 110, M, 6) + c(100, 70, 20, W) + l('M100 70 V58 M100 70 L110 74', K, 3) + r(80, 98, 40, 42, K, 4, 0.3) + c(100, 122, 6, W) + r(64, 146, 72, 8, K, 2);
        break;
      case 'music':
        s += l('M112 98 L160 50', K, 10) + l('M160 50 L174 36', K, 14) + c(80, 126, 32, M) + c(102, 104, 24, M) + c(90, 116, 8, K) + r(70, 130, 24, 4, K, 2);
        break;
      case 'pets':
        s += e(100, 118, 34, 28, M) + e(68, 86, 11, 15, M, -20) + e(92, 70, 11, 16, M, -6) + e(116, 70, 11, 16, M, 6) + e(140, 86, 11, 15, M, 20);
        break;
      case 'services':
        s += r(60, 36, 80, 114, K, 8) + r(68, 52, 64, 90, W, 3) + r(84, 30, 32, 14, M, 4);
        for (let i = 0; i < 3; i++) { s += c(82, 72 + i * 26, 5, M) + r(94, 70 + i * 26, 32, 4, K, 2, 0.5); }
        break;
      case 'jobs':
        s += l('M80 72 V58 Q80 50 88 50 H112 Q120 50 120 58 V72', K, 8) + r(40, 70, 120, 78, M, 10) + r(40, 100, 120, 6, K, 0, 0.25) + r(92, 98, 16, 14, W, 3);
        break;
      case 'free':
        s += r(56, 86, 88, 62, M, 4) + r(50, 72, 100, 16, W, 4) + r(94, 72, 12, 76, Y) + e(84, 62, 15, 9, Y, -20) + e(116, 62, 15, 9, Y, 20) + c(100, 68, 6, Y);
        break;
      default:
        s += r(60, 60, 80, 80, M, 12);
    }
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">' + r(0, 0, 200, 200, bg) + s + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export function mix(hex: string, t: number): string {
    const n = parseInt(hex.slice(1), 16);
    const ch = [n >> 16 & 255, n >> 8 & 255, n & 255].map((v: number) => { return Math.round(v + (255 - v) * t); });
    return '#' + ch.map((v: number) => { return ('0' + v.toString(16)).slice(-2); }).join('');
}
