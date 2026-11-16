export default {
    testEnvironment: 'jsdom',
    transform: {
      '^.+\\.(js|jsx)$': '<rootDir>/jest.viteTransform.cjs'
    },
    moduleNameMapper: {
      '\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js', // identity-obj-proxy is not installed
      '\\.(jpg|jpeg|png|gif|webp|wav|mp3|ogg)$': '<rootDir>/__mocks__/fileMock.js'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleFileExtensions: ['js', 'jsx', 'json'],
  };