/*
This file contains API calls to the OpenSearch cluster to register and deploy an ml model to the opensearch cluster.
It also creates a neural ingest pipeline to allow for ingesting of documents into a K-Nearest Neighbors index.
*/
export default async function (client) {
  //Set cluster settings
  const cluster_settings_request = {
    path: '/_cluster/settings',
    body: {
      persistent: {
        plugins: {
          ml_commons: {
            only_run_on_ml_node: 'false',
            model_access_control_enabled: 'true',
            native_memory_threshold: '99',
          },
        },
      },
    },
  }

  try {
    const resp = await client.http.put(cluster_settings_request)

    if (resp && resp.statusCode == 200) {
      console.log('Updated ML-related cluster settings.')
    } else {
      console.log(
        'Error. Could not update cluster settings. Returned with response: ',
        resp
      )
      return
    }
  } catch (e) {
    console.log('Error: ', e)
    return
  }

  //Register model group
  const register_model_group_request = {
    path: '/_plugins/_ml/model_groups/_register',
    body: {
      name: 'NLP_model_group',
      description: 'A model group for NLP models',
    },
  }

  let model_group_id
  try {
    const resp = await client.http.post(register_model_group_request)

    if (resp && resp.statusCode == 200) {
      model_group_id = resp.body.model_group_id
      console.log(`Registered model group with id: ${model_group_id}`)
    } else {
      console.log(
        'Error. Could not register model group. Returned with response: ',
        resp
      )
      return
    }
  } catch (e) {
    console.log('Error: ', e)
    return
  }

  //Register model to model group
  const register_model_request = {
    path: '/_plugins/_ml/models/_register',
    body: {
      name: 'huggingface/sentence-transformers/all-MiniLM-L6-v2',
      version: '1.0.1',
      model_group_id,
      model_format: 'TORCH_SCRIPT',
    },
  }

  let task_id
  try {
    const resp = await client.http.post(register_model_request)

    if (resp && resp.statusCode == 200) {
      task_id = resp.body.task_id
      console.log('Registering model to model group. Task ID is: ', task_id)
    } else {
      console.log(
        'Error. Could not register model to model group. Returned with response: ',
        resp
      )
      return
    }
  } catch (e) {
    console.log('Error: ', e)
    return
  }

  //Check status of model registration
  const check_model_registration_request = {
    path: `_plugins/_ml/tasks/${task_id}`,
  }

  let model_id = ''
  try {
    let resp
    do {
      resp = await client.http.get(check_model_registration_request)

      if (resp && resp.statusCode == 200) {
        console.log('Checking model registration status...')

        if (resp.body.state === 'COMPLETED') {
          model_id = resp.body.model_id
          console.log('Model registration completed. Model ID: ', model_id)
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for 2 seconds before checking again
        }
      } else {
        console.log(
          'Error. Could not check model registration status. Returned with response: ',
          resp
        )
        return
      }
    } while (resp.body.state !== 'COMPLETED')
  } catch (e) {
    console.log('Error: ', e)
    return
  }

  //Deploy model
  const deploy_model_request = {
    path: `/_plugins/_ml/models/${model_id}/_deploy`,
  }

  try {
    const resp = await client.http.post(deploy_model_request)

    if (resp && resp.statusCode == 200) {
      task_id = resp.body.task_id
      console.log('Deploying model. Task ID is: ', task_id)
    } else {
      console.log(
        'Error. Could not deploy model. Returned with response: ',
        resp
      )
      return
    }
  } catch (e) {
    console.log('Error: ', e)
    return
  }

  //Check status of model deployment
  const check_model_deployment_request = {
    path: `_plugins/_ml/tasks/${task_id}`,
  }

  try {
    let resp
    do {
      resp = await client.http.get(check_model_deployment_request)

      if (resp && resp.statusCode == 200) {
        console.log('Checking model deployment status...')

        if (resp.body.state === 'COMPLETED') {
          model_id = resp.body.model_id
          console.log('Model deployment completed. Model ID: ', model_id)
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for 2 seconds before checking again
        }
      } else {
        console.log(
          'Error. Could not check model deployment status. Returned with response: ',
          resp
        )
        return
      }
    } while (resp.body.state !== 'COMPLETED')
  } catch (e) {
    console.log('Error: ', e)
    return
  }

  //Create neural ingest pipeline
  const pipeline_name = 'nlp-ingest-pipeline'
  const create_ingest_pipeline_request = {
    path: `/_ingest/pipeline/${pipeline_name}`,
    body: {
      description: 'An NLP ingest pipeline',
      processors: [
        {
          text_embedding: {
            model_id,
            field_map: {
              body: 'circular_embedding',
            },
          },
        },
      ],
    },
  }

  try {
    const resp = await client.http.put(create_ingest_pipeline_request)

    if (resp && resp.statusCode == 200) {
      console.log('Successfully created neural ingest pipeline.')
    } else {
      console.log(
        'Error. Could not create neural ingest pipeline. Returned with response: ',
        resp
      )
      return
    }
  } catch (e) {
    console.log('Error: ', e)
    return
  }

  //Create knn index
  await client.indices.create({
    index: 'circulars',
    body: {
      settings: {
        'index.knn': true,
        default_pipeline: pipeline_name,
      },
      mappings: {
        properties: {
          subject: {
            type: 'text',
          },
          submittedHow: {
            type: 'text',
          },
          bibcode: {
            type: 'text',
          },
          createdOn: {
            type: 'long',
          },
          circularId: {
            type: 'integer',
          },
          submitter: {
            type: 'text',
          },
          circular_embedding: {
            type: 'knn_vector',
            dimension: 384,
            method: {
              engine: 'lucene',
              space_type: 'l2',
              name: 'hnsw',
              parameters: {},
            },
          },
          body: {
            type: 'text',
          },
        },
      },
    },
  })
}
