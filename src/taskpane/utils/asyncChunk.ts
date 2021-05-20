/**
 * Execute a given function on a sliceable object
 * Credits: https://gist.github.com/anonymous/9279e2588ad9359085b8c66da5e94c41#file-chunk-js
 >> asyncChunk([], ((chunk, acc) => acc.concat(chunk)), [], 100);
 * */
export function asyncChunk<Input, Output>(
    data: Input[],
    functionToApply: (chunk: Input[], acc: Output[]) => Promise<Output[]>,
    chunkSize: number = 100,
    initialAcc: Output[] = [],
) {
    const totalSize = data.length;

    /* Create a promise chain starting with our initial accumulator */
    let promise = Promise.resolve(initialAcc)

    /* Start at the beginning of the object */
    let chunkHead = 0

    /* Loop through each chunk */
    while (chunkHead < totalSize) {
        /* Create variables in closure */
        const chunkStart = chunkHead;
        const chunkEnd = chunkStart + chunkSize;
        const chunk = data.slice(chunkStart, chunkEnd);

        /* Chain the chunk's promise on requestAnimationFrame */
        console.time()
        promise = promise.then(accu => new Promise((resolve) => {
                requestAnimationFrame(() => {
                    /* Wrap the result in a promise so that we can safely receive a promise or a value */
                    functionToApply(chunk, accu).then(ret => {
                        console.timeEnd()
                        resolve(ret)
                    })
                })
            })
        )

        chunkHead = chunkEnd
    }

    return promise;
}
