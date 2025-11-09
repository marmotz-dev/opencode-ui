const esModules = ''

export default {
  rootDir: './src',
  setupFilesAfterEnv: ['../jest.setup.js'],
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!${esModules})`],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        allowSyntheticDefaultImports: true,
      },
    ],
    '^.+\\.js$': 'babel-jest',
  },
}
