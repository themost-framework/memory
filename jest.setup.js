global.console = {
    ...console,
    // uncomment to ignore a specific log level
    // eslint-disable-next-line no-undef
    log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};
