import { tables } from '@architect/functions'
import { getUser } from '../__auth/user.server'

export type CircularModel = {
  id?: string
  subject: string
  body: string
  submitter?: string
  created?: string
  linkedEvent?: string
}

export class CircularsServer {
  #sub?: string

  private constructor(sub?: string) {
    this.#sub = sub
  }

  static async create(request?: Request) {
    if (request) {
      const user = await getUser(request)
      if (!user)
        throw new Response('not signed in', {
          statusText: 'not signed in',
          status: 403,
        })
      return new this(user.sub)
    }
    return new this()
  }

  async getCirculars(searchString: string) {
    let result = await this.scanCircularsTable(searchString, null)
    let items: CircularModel[] = result.Items
    while (result.LastEvaluatedKey) {
      result = await this.scanCircularsTable(
        searchString,
        result.LastEvaluatedKey
      )
      items = [...items, ...result.Items]
    }
    return { items }
  }

  async scanCircularsTable(searchString: string, lastEvaluatedKey: any) {
    const db = await tables()
    const result = await db.gcn_circulars.scan({
      ExclusiveStartKey: lastEvaluatedKey,
      ExpressionAttributeNames: {
        '#subject': 'subject',
        '#body': 'body',
        '#created': 'created',
        '#id': 'id',
        '#linkedEvent': 'linkedEvent',
      },
      ExpressionAttributeValues: {
        ':searchTerm': searchString,
      },
      FilterExpression:
        'contains(#subject, :searchTerm) OR contains(#body, :searchTerm)',
      ProjectionExpression: '#subject, #body, #created, #id, #linkedEvent',
    })
    return result
  }

  async createNewCircular(circularModel: CircularModel) {
    // Validation?
    const db = await tables()

    await db.gcn_circulars.put({
      id: crypto.randomUUID(), // Partition key
      created: Date.now().toString(), // sort key
      sub: this.#sub,
      subject: circularModel.subject,
      body: circularModel.body,
      title: 'GCN CIRCULAR',
      linkedEvent: circularModel.linkedEvent,
      correctedCircularId: circularModel.id, // Should be null in new cases, and have a value for tracking errata
    })
  }

  // async updateGCNCircular(circularModel: CircularModel) {
  //   const db = await tables()
  //   await db.gcn_circulars.update({
  //     Key: {
  //       id: circularModel.id,
  //     },
  //     UpdateExpression: 'set #subject = :subject, #body=:body',
  //     ExpressionAttributeNames: {
  //       '#subject': 'subject',
  //       '#body': 'body',
  //     },
  //     ExpressionAttributeValues: {
  //       ':subject': circularModel.subject,
  //       ':body': circularModel.body,
  //     },
  //   })
  // }

  async getCircularById(id: string, created: string): Promise<CircularModel> {
    const db = await tables()
    const result = await db.gcn_circulars.get({
      id: id,
      created: created,
    })
    if (!result) throw new Response(null, { status: 404 })
    return result
  }

  async getUserSubmittedCirculars() {
    const db = await tables()
    const result = await db.gcn_circulars.scan({
      ExpressionAttributeNames: {
        '#subject': 'subject',
        '#body': 'body',
        '#created': 'created',
        '#id': 'id',
        '#sub': 'sub',
        '#linkedEvent': 'linkedEvent',
      },
      ExpressionAttributeValues: {
        ':sub': this.#sub,
      },
      FilterExpression: '#sub = :sub',
      ProjectionExpression: '#subject, #body, #created, #id, #linkedEvent',
    })

    return result.Items as CircularModel[]
  }
}
