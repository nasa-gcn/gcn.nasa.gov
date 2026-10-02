const data = {
  index_templates: [
    {
      name: 'circulars_template',
      index_template: {
        index_patterns: ['circular*'],
        template: {
          settings: {
            index: {
              number_of_shards: '1',
              number_of_replicas: '1',
            },
          },
          mappings: {},
        },
        priority: 1,
        version: 1,
        _meta: { description: 'Circulars template' },
      },
    },
    {
      name: 'synonyms_template',
      index_template: {
        index_patterns: ['synonym*'],
        template: {
          settings: {
            index: {
              number_of_shards: '1',
              number_of_replicas: '1',
            },
          },
          mappings: {},
        },
        priority: 1,
        version: 1,
        _meta: { description: 'Synonyms template' },
      },
    },
    {
      name: 'users_template',
      index_template: {
        index_patterns: ['user*'],
        template: {
          settings: {
            index: {
              number_of_shards: '1',
              number_of_replicas: '1',
            },
          },
        },
        priority: 1,
        version: 1,
        _meta: { description: 'Users template' },
      },
    },
  ],
}

export default async function (client) {
  const promises = data.index_templates.map(({ name, index_template }) => {
    return client.indices.putIndexTemplate({
      name,
      body: index_template,
    })
  })
  await Promise.all(promises)
}
