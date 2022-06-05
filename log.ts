import { AssertionError } from "assert";

const fg = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    magenta: "\x1b[95m",
    cyan: "\x1b[96m",
    blue: "\x1b[94m",
    yellow: "\x1b[33m",
    reset: "\x1b[0m"
}

interface Logger {
    info(msg: string): void;
    debug(msg: string): void;
    assert(msg: string, condition: boolean, opts: { actual: any; expected: any; }): void;
    error(msg: string, e?: Error): void;
    fn<T>(verb: string | [string, string], msg: string, fn: () => T): T
}

const makeLogger = (prefix: string) => (category: string) => (message: string) => console.log(`${prefix} ${category}`, message)

const clogger = makeLogger(`${fg.cyan}client${fg.reset}`)
const slogger = makeLogger(`${fg.magenta}server${fg.reset}`)

const toPresentContinuous = (verb: string): string => verb + 'ing';
const toPastTense = (verb: string): string => {
    if (verb.endsWith('d')) {
        return verb.slice(0, -1) + 't';
    }

    if (verb.endsWith('e')) {
        return verb + 'd'
    }
    return verb + 'ed'
}

const makeLogFn = (logger: Logger) => {
    return <T>(verb: string | [string, string], message: string, fn: () => T) => {
        let continuousTense = undefined;
        let pastTense = undefined;

        if (verb.length === 2) {
            continuousTense = verb[0]
            pastTense = verb[1]
        } else {
            continuousTense = toPresentContinuous(verb as string);
            pastTense = toPastTense(verb as string);
        }

        logger.debug(`${continuousTense} ${message}`);
        const logOk = () => logger.info(`${pastTense} ${message}`);
        const logErr = (e: Error) => logger.error(`${continuousTense} ${message}`, e);

        try {
            const result = fn()
            if (result instanceof Promise) {
                result.then(logOk).catch(logErr)
            } else {
                logOk()
            }

            return result;
        } catch (e) {
            logErr(e);
            throw e;
        }
    }
}

const makeCategoryLogger = (logger: (cat: string) => (msg: string) => void) => {
    const l: Logger = {
        info: logger(`${fg.green}info${fg.reset}\t`),
        debug: logger(`${fg.yellow}debug${fg.reset}\t`),
        assert: (msg, cond, opts) => {
            const log = logger(`${fg.reset}assert${fg.reset}\t`)

            if (cond) {
                log(`${msg} ... ${fg.green}OK${fg.reset}`)
            } else {
                log(`${msg} ... ${fg.red}FAIL${fg.reset} ` + (opts ? `\n\texpected ${opts.expected} but got ${opts.actual}` : ''))
                throw new Error(`${msg} >> assertion failed`)
            }
        },
        error: (msg, err) => {
            logger(`${fg.red}error${fg.reset}\t`)(msg + '>>' + err.message)
        },
        fn: undefined
    }

    l.fn = makeLogFn(l)
    return l
}

export const clog = makeCategoryLogger(clogger)
export const slog = makeCategoryLogger(slogger)

