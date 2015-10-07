/*eslint camelcase:0 */
import {camelizeJson, snakeizeJson} from './JsonUtils';

let getKnex;
try {
  let extensions = require('research-extensions');
  getKnex = extensions.getKnex;
}
catch (err) {
  getKnex = require('./ConnectionManager');
}
let mockDB = {
  'UIT': {
    colors: {
      'one': '#348FF7',
      'two': '#0E4BB6',
      'three': '#048EAF',
      'four': '#EDF2F2'
    }
  }
};

let createDeleteQueries = (query, collection, tableProps) => {

  let sel = query(tableProps.table).select(tableProps.pk);
  if (tableProps.where) {
    sel = sel.where(tableProps.where.key, tableProps.where.value);
  }

  return sel.then(results => {
    Promise.all(
      results.filter(result => {
        let match = collection.find(item => {
          return item[tableProps.pk] && (item[tableProps.pk] === result[tableProps.pk]);
        });
        return !match
      }).map(result => {
        return query(tableProps.table)
        .update({active: false})
        .where(tableProps.pk, result[tableProps.pk])
      })
    );
  })
}

let createInsertQueries = (query, collection, tableProps) => {
  return Promise.all(
    collection.map(line => {
      line.active = true;
      if (tableProps.parent) {
        line[tableProps.parent.key] = tableProps.parent.value;
      }
      return query(tableProps.table)
      .insert(line, tableProps.pk);
    })
  );
}

let createUpdateQueries = (query, collection, tableProps) => {
  return Promise.all(
    collection.map(line => {
      return query(tableProps.table)
      .update(line)
      .where(tableProps.pk, line[tableProps.pk]);
    })
  );
}

let createCollectionQueries = (query, collection, tableProps) => {
  let updates = [];
  let inserts = [];
  collection.forEach(line => {
    if (line[tableProps.pk] === undefined) {
      inserts.push(line);
    } else {
      updates.push(line);
    }
  });

  return Promise.all([
    createDeleteQueries(query, collection, tableProps),
    createInsertQueries(query, inserts, tableProps),
    createUpdateQueries(query, updates, tableProps)
  ])
};

let convertQuestionFormat = (questions) =>{
  return questions.map(question=>{
    question.question = JSON.stringify(question.question);
    if (isNaN(question.id)) {
      delete question.id;
    }
    return question;
  });
};

export let getConfig = (dbInfo, userId, optionalTrx) => {
  var config = mockDB.UIT;
  let knex = getKnex(dbInfo);

  let query;
  if (optionalTrx) {
    query = knex.transacting(optionalTrx);
  }
  else {
    query = knex;
  }
  return Promise.all([
    query.select('*').from('relationship_category_type'),
    query.select('*').from('relationship_type').where('active', true),
    query.select('*').from('relationship_amount_type').where('active', true),
    query.select('*').from('relationship_person_type').where('active', true),
    query.select('*').from('declaration_type').where('active', true),
    query.select('*').from('disclosure_type'),
    query.select('*').from('notification'),
    query.select('*').from('questionnaire').limit(1).where('type_cd', 1).orderBy('version', 'desc').then(result => {
      if (result[0]) {
        return query.select('*').from('questionnaire_question as qq').where({questionnaire_id: result[0].id, active: true});
      }
    }),
    query.select('*').from('questionnaire').limit(1).where('type_cd', 2).orderBy('version', 'desc').then(result => {
      if (result[0]) {
        return query.select('*').from('questionnaire_question as qq').where({questionnaire_id: result[0].id, active: true});
      }
    }),
    query('config').select('config').where('name', 'General Config'),
    query.select('*').from('disclosure_status'),
    query.select('*').from('project_type')
  ])
  .then(result => {
    config.matrixTypes = result[0];
    config.matrixTypes.map(type => {
      type.typeOptions = result[1].filter(relationType =>{
        return relationType.relationship_cd === type.type_cd;
      });
      type.amountOptions = result[2].filter(amountType =>{
        return amountType.relationship_cd === type.type_cd;
      });
      return type;
    });
    config.relationshipPersonTypes = result[3];
    config.declarationTypes = result[4];
    config.disclosureTypes = result[5];
    config.notifications = result[6];
    config.questions = {};
    config.questions.screening = result[7] ? result[7].map(question=>{
      question.question = JSON.parse(question.question);
      return question;
    }) : [];
    config.questions.entities = result[8] ? result[8].map(question=>{
      question.question = JSON.parse(question.question);
      return question;
    }) : [];

    config.disclosureStatus = result[10];
    config.projectTypes = result[11];

    config = camelizeJson(config);

    config.general = JSON.parse(result[9][0].config);
    return config;
  });
};

export let setConfig = (dbInfo, userId, body, optionalTrx) => {
  let config = snakeizeJson(body);
  let knex = getKnex(dbInfo);
  let query;
  if (optionalTrx) {
    query = knex.transacting(optionalTrx);
  }
  else {
    query = knex;
  }

  let queries = [];

  config.matrix_types.forEach(type => {
    queries.push(
      query('relationship_category_type').update({
        enabled: type.enabled,
        type_enabled: type.type_enabled,
        amount_enabled: type.amount_enabled
      })
      .where('type_cd', type.type_cd)
    )

    queries.push(
      createCollectionQueries(query, type.type_options, {pk: 'type_cd', table: 'relationship_type', where: {key: 'relationship_cd', value: type.type_cd}})
    )

    queries.push(
      createCollectionQueries(query, type.amount_options, {pk: 'type_cd', table: 'relationship_amount_type', where: {key: 'relationship_cd', value: type.type_cd}})
    )
  })

  queries.push(
    createCollectionQueries(query, config.declaration_types, {pk: 'type_cd', table: 'declaration_type'})
  );

  queries.push(
    createCollectionQueries(query, config.relationship_person_types, {pk: 'type_cd', table: 'relationship_person_type'})
  );

  queries.push(
    createCollectionQueries(query, config.disclosure_types, {pk: 'type_cd', table: 'disclosure_type'})
  );

  queries.push(
    createCollectionQueries(query, config.notifications, {pk: 'id', table: 'notification'})
  );

  queries.push(
    query.select('*').from('questionnaire').limit(1).where('type_cd', 1).orderBy('version', 'desc')
      .then(result => {
        if (result[0]) {
          return createCollectionQueries(query, convertQuestionFormat(config.questions.screening), {
            pk: 'id',
            table: 'questionnaire_question',
            where: {key: 'questionnaire_id', value: result[0].id},
            parent: {key: 'questionnaire_id', value: result[0].id}
          });
        } else {
          return query('questionnaire').insert({version: 1, type_cd: 1}).then(id => {
            return createCollectionQueries(query, convertQuestionFormat(config.questions.screening), {
              pk: 'id',
              table: 'questionnaire_question',
              where: {key: 'questionnaire_id', value: id[0]},
              parent: {key: 'questionnaire_id', value: id[0]}
            });
          });
        }
      })
  );

  queries.push(
    query.select('*').from('questionnaire').limit(1).where('type_cd', 2).orderBy('version', 'desc')
      .then(result => {
        if (result[0]) {
          return createCollectionQueries(query, convertQuestionFormat(config.questions.entities), {
            pk: 'id',
            table: 'questionnaire_question',
            where: {key: 'questionnaire_id', value: result[0].id},
            parent: {key: 'questionnaire_id', value: result[0].id}
          });
        } else {
          return query('questionnaire').insert({version: 1, type_cd: 2}).then(id => {
            return createCollectionQueries(query, convertQuestionFormat(config.questions.entities), {
              pk: 'id',
              table: 'questionnaire_question',
              where: {key: 'questionnaire_id', value: id[0]},
              parent: {key: 'questionnaire_id', value: id[0]}
            });
          });
        }
      })
  );

  queries.push(
    query('config').update({config: JSON.stringify(body.general)}).where('name', 'General Config')
  );

  return Promise.all(queries)
    .then(() => {
      return camelizeJson(config);
    });
};
