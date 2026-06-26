module.exports = {
  forbidden: [
    /* ===========================
       CLEAN ARCHITECTURE LAYER RULES
    =========================== */

    {
      name: 'application-cannot-depend-on-infrastructure',
      from: { path: '^src/application' },
      to: { path: '^src/infrastructure' },
      severity: 'error',
    },

    {
      name: 'domain-cannot-depend-on-application',
      from: { path: '^src/domain' },
      to: { path: '^src/application' },
      severity: 'error',
    },

    {
      name: 'domain-cannot-depend-on-infrastructure',
      from: { path: '^src/domain' },
      to: { path: '^src/infrastructure' },
      severity: 'error',
    },

    {
      name: 'presentation-cannot-depend-on-infrastructure',
      from: { path: '^src/presentation' },
      to: { path: '^src/infrastructure' },
      severity: 'error',
    },

    /* ===========================
       OPTIONAL: CQRS RULES
    =========================== */

    // command → query
    {
      name: 'command-cannot-depend-on-query',
      from: { path: '^src/application/commands' },
      to: { path: '^src/application/queries' },
      severity: 'error',
    },

    // query → command
    {
      name: 'query-cannot-depend-on-command',
      from: { path: '^src/application/queries' },
      to: { path: '^src/application/commands' },
      severity: 'error',
    },

    // query → write repository
    {
      name: 'query-cannot-use-write-repository',
      from: { path: '^src/application/queries' },
      to: { path: '^src/application/ports/repositories' },
      severity: 'error',
    },

    // command → read model
    {
      name: 'command-cannot-use-read-model',
      from: { path: '^src/application/commands' },
      to: { path: '^src/application/ports/read-models' },
      severity: 'error',
    }
  ],

  options: {
    // ให้ resolve path alias จาก tsconfig
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    exclude: {
      path: 'node_modules',
    },
    doNotFollow: {
      path: 'node_modules',
    },
  },
};
