

export function onTimeWindow(run) {
    return new Promise((resolve: (result: Promise<string[]>) => void) => {
        resolve(run());
        // requestAnimationFrame(() => {
        //     resolve(run());
        // });
    })
}