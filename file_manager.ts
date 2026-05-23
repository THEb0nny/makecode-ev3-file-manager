// ЭТО ЗАГЛУШКИ. Они важны! 
// На роботе они заменятся на C++, в браузере будут работать как JS.

//% shim=pxt::listPrjFiles
function getPrjs(): string[] {
    // Этот код сработает ТОЛЬКО в браузере (симуляторе)
    return ["pxt.rbf", "test.rbf", "Untitled-1.rbf", "Untitled-1.rtf"];
}

//% shim=pxt::deletePrjFile
function delPrj(fn: string): void {
    // В браузере просто выводим в консоль
    console.log("Delete: " + fn);
    return;
}

// А ТЕПЕРЬ ВЫЗЫВАЙ ЭТИ ФУНКЦИИ (а не pxt.list...)
const rawPrograms = getPrjs();

const programs = rawPrograms
    .filter(s =>
        s.substr(s.length - 4, 4) == ".rbf" ||
        s.substr(s.length - 4, 4) == ".rtf"
    )
    // .map(s => s.substr(0, s.length - 4))
    .filter(s => s != "File_manager");

programs.push("");
programs.push("Cancel");
programs.push("Delete 0 files");

let todel: boolean[] = [];
let scrollTop = 0;
let cursor = 0;
let confirm = false;

function showMenu() {
    if (cursor < scrollTop + 2) scrollTop = cursor - 2;
    else if (cursor > scrollTop + 11) scrollTop = cursor - 11;
    if (scrollTop < 0) scrollTop = 0;

    let num = 0;
    for (let i = 0; i < todel.length; ++i) {
        if (todel[i]) num++;
    }
    programs[programs.length - 1] = confirm ? "Enter to confirm" : "Delete " + num + " file(s)";

    brick.clearScreen();

    const h = brick.lineHeight();
    for (let i = 0; i < 13; ++i) {
        const y = i * h;
        const idx = scrollTop + i;
        const fg = idx == cursor ? 0 : 1;
        const bg = idx == cursor ? 1 : 0;
        // screen.fillRect(0, y, screen.width, h, bg);
        const name = programs[scrollTop + i] || "";
        const displayName = name.substr(0, name.length - 4);
        let text = (idx == cursor ? ">" : " ")
            + (todel[idx] ? "*" : " ")
            + " "
            + displayName;
        screen.print(text, 0, y, fg, brick.font);
    }
}

function move(d: number) {
    confirm = false;
    const nc = cursor + d;
    if (0 <= nc && nc < programs.length) cursor = nc;
    showMenu();
}

brick.buttonDown.onEvent(ButtonEvent.Pressed, () => move(1));
brick.buttonUp.onEvent(ButtonEvent.Pressed, () => move(-1));
brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
    if (cursor < programs.length - 3) {
        todel[cursor] = !todel[cursor];
        move(1);
    } else if (cursor == programs.length - 3) {
        // nothing
    } else if (cursor == programs.length - 2) {
        control.reset();
    } else if (cursor == programs.length - 1) {
        if (todel.every(x => !x)) return;
        if (confirm) {
            brick.clearScreen();
            brick.showString("deleting...", 6);
            for (let i = 0; i < todel.length; ++i) {
                if (todel[i]) {
                    const fn = programs[i];
                    if (fn.substr(fn.length - 4, 4) == ".rbf") {
                        delPrj(fn.substr(0, fn.length - 4) + ".elf");
                        delPrj(fn); // rbf
                    } else if (fn.substr(fn.length - 4, 4) == ".rtf") {
                        delPrj(fn);
                    }
                }
            }
            pause(1000);
            control.reset();
        } else {
            confirm = true;
            showMenu();
        }
    }
});

showMenu();