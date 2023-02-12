export function onTimeWindow(run) {
    return new Promise((resolve: (result: Promise<string[]>) => void) => {
        requestAnimationFrame(() => {
            resolve(run());
        });
    })
}
