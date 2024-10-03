const SIDE = 3;
const COLORS = [undefined, "red", "green", "blue", "yellow"];
const PUZZLES = [
    [[-1, 3,-2, 1], [ 1, 3, 2,-4], [-1, 2, 4, 3],
     [-1, 3,-4, 2], [-1,-3,-2, 4], [-1,-4, 3,-2],
     [-3, 4, 3, 4], [ 1, 2,-4,-3], [-1, 2,-2,-4]],
    [[ 1, 2,-3,-4], [ 4, 3,-1,-2], [-2, 1, 4,-3],
     [ 2, 1,-4,-3], [ 1,-2,-3, 4], [-4,-1, 2, 3],
     [ 4,-2,-1, 3], [ 3,-1,-4, 2], [ 4, 3,-2,-1]],
];

const SVG_NS = "http://www.w3.org/2000/svg";
const draw_piece = (svg, t, x, y, rot) => {
    for (let j = 0; j < t.length; ++j) {
        const r = 90*((2 + j + rot) % 4);
        const color = COLORS[Math.abs(t[j])];
        const opacity = (Math.sign(t[j]) < 0) ? 0.3 : 1;
        const el = document.createElementNS(SVG_NS, "path");
        for (const [k, v] of [
            ["d", "M0,0L1,1L-1,1Z"],
            ["stroke", "black"],
            ["stroke-width", 0.05],
            ["stroke-linejoin", "round"],
            ["fill", color],
            ["fill-opacity", opacity],
            ["transform", `scale(20) translate(${x},${y}) rotate(${r},0,0)`]
        ]) {
            el.setAttribute(k, v);
        }
        svg.appendChild(el);
    }
};

const color = (puzzle, i, r, s) => puzzle[i][(s + r) % 4];

const match = (puzzle, config = [], seen = new Set(), found = []) => {
    if (config.length == puzzle.length) {
        found.push(config.map(a => a));
        return found;
    }
    const checks = [];
    if (config.length % SIDE != 0) {
        const [i, r] = config[config.length - 1];
        checks.push([3, color(puzzle, i, r, 1)]);
    }
    if (SIDE <= config.length) {
        const [i, r] = config[config.length - SIDE];
        checks.push([2, color(puzzle, i, r, 0)]);
    }
    for (let i = 0; i < puzzle.length; ++i) {
        if (!seen.has(i)) {
            for (let r = 0; r < 4; ++r) {
                let pass = true;
                for (const [i_, r_] of checks) {
                    if (color(puzzle, i, r, i_) != -r_) {
                        pass = false;
                        break;
                    }
                }
                if (pass) {
                    config.push([i, r]);
                    seen.add(i);
                    found = match(puzzle, config, seen, found);
                    config.pop();
                    seen.delete(i);
                }
            }
        }
    }
    return found;
};

window.onload = () => {
    const svg = document.getElementById("svg");
    for (let p = 0; p < PUZZLES.length; ++p) {
        const puzzle = PUZZLES[p];
        for (let i = 0; i < puzzle.length; ++i) {
            const t = puzzle[i];
            const x = 3*i + 2;
            const y = 2 + p*12;
            draw_piece(svg, t, x, y, 0);
        }
        const solutions = match(puzzle);
        for (let i = 0; i < solutions.length; ++i) {
            const S = solutions[i];
            for (let j = 0; j < puzzle.length; ++j) {
                const [ti, r] = S[j];
                const t = puzzle[ti];
                const x = 2*(j % 3) + 2 + 7*i;
                const y = 9 - 2*Math.floor(j / 3) + p*12;
                draw_piece(svg, t, x, y, -r);
            }
        }
    }
};
