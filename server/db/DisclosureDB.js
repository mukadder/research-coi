/*
    The Conflict of Interest (COI) module of Kuali Research
    Copyright © 2015 Kuali, Inc.

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

/*eslint camelcase:0 */
import {isDisclosureUsers} from './CommonDB';
import * as FileService from '../services/fileService/FileService';
import {camelizeJson} from './JsonUtils';
import {COIConstants} from '../../COIConstants';

const ONE_DAY = 1000 * 60 * 60 * 24;

let getKnex;
try {
  let extensions = require('research-extensions');
  getKnex = extensions.getKnex;
}
catch (err) {
  getKnex = require('./ConnectionManager');
}

export let saveNewFinancialEntity = (dbInfo, userInfo, disclosureId, financialEntity, files) => {
  let knex = getKnex(dbInfo);

  return isDisclosureUsers(dbInfo, disclosureId, userInfo.schoolId)
    .then(isSubmitter => {
      if (!isSubmitter) {
        throw Error(`Attempt by ${userInfo.username} to associate an entity with disclosure ${disclosureId} that isnt the users`);
      }

      return knex('fin_entity')
        .insert({
          disclosure_id: disclosureId,
          active: financialEntity.active,
          name: financialEntity.name,
          description: financialEntity.description,
          status: COIConstants.RELATIONSHIP_STATUS.IN_PROGRESS
        }, 'id')
        .then(id => {
          financialEntity.id = id[0];
          let queries = [];
          financialEntity.relationships.forEach(relationship => {
            relationship.finEntityId = id[0];
            queries.push(
              knex('relationship')
                .insert({
                  fin_entity_id: id[0],
                  relationship_cd: relationship.relationshipCd,
                  person_cd: relationship.personCd,
                  type_cd: !relationship.typeCd ? null : relationship.typeCd,
                  amount_cd: !relationship.amountCd ? null : relationship.amountCd,
                  comments: relationship.comments,
                  status: COIConstants.RELATIONSHIP_STATUS.IN_PROGRESS
                }, 'id')
                .then(relationshipId=>{
                  relationship.id = relationshipId[0];
                  if (relationship.relationshipCd === COIConstants.ENTITY_RELATIONSHIP.TRAVEL) {
                    return knex('travel_relationship')
                      .insert({
                        relationship_id: relationshipId[0],
                        amount: relationship.travel.amount,
                        destination: relationship.travel.destination,
                        start_date: new Date(relationship.travel.startDate),
                        end_date: new Date(relationship.travel.endDate),
                        reason: relationship.travel.reason
                      }, 'id');
                  }
                })
            );
          });

          financialEntity.answers.forEach(answer=>{
            queries.push(
              knex('questionnaire_answer')
                .insert({
                  question_id: answer.questionId,
                  answer: JSON.stringify(answer.answer)
                }, 'id')
                .then(result => {
                  answer.id = result[0];
                  return knex('fin_entity_answer')
                    .insert({
                      fin_entity_id: id[0],
                      questionnaire_answer_id: result[0]
                    }, 'id');
                })
            );
          });

          financialEntity.files = [];
          files.forEach(file=>{
            let fileData = {
              file_type: COIConstants.FILE_TYPE.FINANCIAL_ENTITY,
              ref_id: financialEntity.id,
              type: file.mimetype,
              key: file.filename,
              name: file.originalname,
              user_id: userInfo.schoolId,
              uploaded_by: userInfo.name,
              upload_date: new Date()
            };
            queries.push(
              knex('file')
                .insert(fileData, 'id')
                .then(fileId => {
                  fileData.id = fileId[0];
                  financialEntity.files.push(fileData);
                })
            );
          });

          return Promise.all(queries)
            .then(() => {
              return financialEntity;
            });
        });
    });
};

let isEntityUsers = (knex, entityId, userId) => {
  return knex.select('e.id')
    .from('fin_entity as e')
    .innerJoin('disclosure as d', 'd.id', 'e.disclosure_id')
    .where({
      'e.id': entityId,
      'd.user_id': userId
    })
    .then(rows => {
      return rows.length > 0;
    });
};

export let saveExistingFinancialEntity = (dbInfo, userInfo, entityId, body, files) => {
  let knex = getKnex(dbInfo);

  let financialEntity = body;

  return isEntityUsers(knex, entityId, userInfo.schoolId)
    .then(isOwner => {
      if (!isOwner) {
        throw Error(`Attempt by ${userInfo.username} to update entity ${entityId} not owned by user`);
      }

      return knex('fin_entity')
        .where('id', entityId)
        .update({
          active: financialEntity.active,
          name: financialEntity.name,
          description: financialEntity.description
        })
        .then(() => {
          let queries = [];

          queries.push(
            knex('relationship')
              .select('*')
              .where('fin_entity_id', entityId)
              .then(dbRelationships => {
                return Promise.all(
                  dbRelationships.filter(dbRelationship => {
                    let match = financialEntity.relationships.find(relationship => {
                      return relationship.id === dbRelationship.id;
                    });
                    return !match;
                  }).map(dbRelationship => {
                    return knex('travel_relationship')
                      .del()
                      .where('relationship_id', dbRelationship.id)
                      .then(() => {
                        return knex('relationship')
                          .del()
                          .where('id', dbRelationship.id);
                      });
                  })
                );
              })
          );

          financialEntity.relationships.map(relationship => {
            if (isNaN(relationship.id)) {
              relationship.finEntityId = entityId;
              queries.push(
                knex('relationship')
                  .insert({
                    fin_entity_id: entityId,
                    relationship_cd: relationship.relationshipCd,
                    person_cd: relationship.personCd,
                    type_cd: !relationship.typeCd ? null : relationship.typeCd,
                    amount_cd: !relationship.amountCd ? null : relationship.amountCd,
                    comments: relationship.comments
                  }, 'id')
                  .then(relationshipId=>{
                    relationship.id = relationshipId[0];
                    if (relationship.relationshipCd === COIConstants.ENTITY_RELATIONSHIP.TRAVEL) {
                      return knex('travel_relationship')
                        .insert({
                          relationship_id: relationshipId[0],
                          amount: relationship.travel.amount,
                          destination: relationship.travel.destination,
                          start_date: new Date(relationship.travel.startDate),
                          end_date: new Date(relationship.travel.endDate),
                          reason: relationship.travel.reason
                        }, 'id');
                    }
                  })
              );
            }
          });

          financialEntity.answers.forEach(answer => {
            if (answer.id) {
              queries.push(
                knex('questionnaire_answer').update({
                  question_id: answer.questionId,
                  answer: JSON.stringify(answer.answer)
                })
                .where('id', answer.id)
              );
            } else {
              queries.push(
                knex('questionnaire_answer').insert({
                  question_id: answer.questionId,
                  answer: JSON.stringify(answer.answer)
                }, 'id').then(result =>{
                  answer.id = result[0];
                  return knex('fin_entity_answer').insert({
                    fin_entity_id: entityId,
                    questionnaire_answer_id: result[0]
                  }, 'id');
                })
              );
            }
          });

          queries.push(
            knex.select('*')
              .from('file')
              .where({
                ref_id: entityId,
                file_type: COIConstants.FILE_TYPE.FINANCIAL_ENTITY
              })
              .then(results => {
                if (results) {
                  results.forEach(result => {
                    let match = financialEntity.files.find(file => {
                      return result.id === file.id;
                    });
                    if (!match) {
                      queries.push(
                        knex('file').where('id', result.id).del()
                        .then(() => {
                          return new Promise((resolve, reject) => {
                            FileService.deleteFile(result.key, err => {
                              if (err) {
                                reject(err);
                              } else {
                                resolve();
                              }
                            });
                          });
                        })
                      );
                    }
                  });
                }
              })
          );

          files.forEach(file => {
            let fileData = {
              file_type: COIConstants.FILE_TYPE.FINANCIAL_ENTITY,
              ref_id: entityId,
              type: file.mimetype,
              key: file.filename,
              name: file.originalname,
              user_id: userInfo.schoolId,
              uploaded_by: userInfo.name,
              upload_date: new Date()
            };
            queries.push(
              knex('file')
                .insert(fileData, 'id')
                .then(id => {
                  fileData.id = id[0];
                  financialEntity.files.push(fileData);
                })
            );
          });

          return Promise.all(queries)
            .then(() => {
              return financialEntity;
            });
        });
    });
};

export let saveDeclaration = (dbInfo, userId, disclosureId, record) => {
  return isDisclosureUsers(dbInfo, disclosureId, userId)
    .then(isSubmitter => {
      if (!isSubmitter) {
        throw Error(`Attempt by user id ${userId} to create a declaration for disclosure ${disclosureId} which isnt the users`);
      }

      let knex = getKnex(dbInfo);
      return knex('declaration')
        .insert({
          project_id: record.projectId,
          disclosure_id: disclosureId,
          fin_entity_id: record.finEntityId,
          type_cd: record.typeCd,
          comments: record.comments
        }, 'id').then(id => {
          record.id = id[0];
          return record;
        });
    });
};

export let saveExistingDeclaration = (dbInfo, userId, disclosureId, declarationId, record) => {
  return isDisclosureUsers(dbInfo, disclosureId, userId)
    .then(isSubmitter => {
      if (!isSubmitter) {
        throw Error(`Attempt by userId ${userId} to save a declaration on disclosure ${disclosureId} which isnt theirs`);
      }

      let knex = getKnex(dbInfo);

      return knex('declaration')
        .update({
          'type_cd': record.typeCd,
          'comments': record.comments
        })
        .where({
          'disclosure_id': disclosureId,
          id: declarationId
        });
    });
};

export let saveNewQuestionAnswer = (dbInfo, userId, disclosureId, body) => {
  return isDisclosureUsers(dbInfo, disclosureId, userId)
    .then(isSubmitter => {
      if (!isSubmitter) {
        throw Error(`Attempt by user id ${userId} to save a question answer on disclosure ${disclosureId} which isnt theirs`);
      }

      let knex = getKnex(dbInfo);
      let answer = body;
      return knex('questionnaire_answer')
        .insert({
          question_id: body.questionId,
          answer: JSON.stringify(body.answer)
        }, 'id')
        .then(result => {
          answer.id = result[0];
          return knex('disclosure_answer')
            .insert({
              disclosure_id: disclosureId,
              questionnaire_answer_id: result[0]
            }, 'id')
            .then(() => {
              return body;
            });
        });
    });
};

export let saveExistingQuestionAnswer = (dbInfo, userId, disclosureId, questionId, body) => {
  return isDisclosureUsers(dbInfo, disclosureId, userId)
    .then(isSubmitter => {
      if (!isSubmitter) {
        throw Error(`Attempt by user id ${userId} to save a question answer on disclosure ${disclosureId} which isnt theirs`);
      }

      let knex = getKnex(dbInfo);
      return knex.select('qa.id')
        .from('disclosure_answer as da')
        .innerJoin('questionnaire_answer as qa', 'da.questionnaire_answer_id', 'qa.id')
        .where('da.disclosure_id', disclosureId)
        .andWhere('qa.question_id', questionId)
        .then(result => {
          return knex('questionnaire_answer')
            .where('id', result[0].id)
            .update('answer', JSON.stringify(body.answer))
            .then(() => {
              return body;
            });
        });
    });
};

let retrieveComments = (dbInfo, userId, disclosureId) => {
  let knex = getKnex(dbInfo);

  return knex('comment')
    .select('id', 'disclosure_id as disclosureId', 'topic_section as topicSection', 'topic_id as topicId', 'text', 'author', 'user_id as userId', 'date', 'pi_visible as piVisible', 'reviewer_visible as reviewerVisible')
    .where('disclosure_id', disclosureId)
    .then(comments => {
      comments.forEach(comment => {
        comment.isCurrentUser = comment.userId == userId; // eslint-disable-line eqeqeq
      });
      return comments;
    })
    .catch(err => {
      throw err;
    });
};

let flagPIReviewNeeded = (dbInfo, disclosureId, section, id) => {
  let knex = getKnex(dbInfo);

  return knex.select('*')
    .from('pi_review')
    .where({
      'disclosure_id': disclosureId,
      'target_type': section,
      'target_id': id
    }).then(rows => {
      if (rows.length > 0) {
        return knex('pi_review').update({
          'reviewed_on': null
        }).where({
          'disclosure_id': disclosureId,
          'target_type': section,
          'target_id': id
        });
      }
      else {
        return knex('pi_review').insert({
          'disclosure_id': disclosureId,
          'target_type': section,
          'target_id': id
        }, 'id');
      }
    });
};

export let addComment = (dbInfo, userInfo, comment) => {
  let knex = getKnex(dbInfo);

  return knex('comment')
    .insert({
      disclosure_id: comment.disclosureId,
      topic_section: comment.topicSection,
      topic_id: comment.topicId,
      text: comment.text,
      user_id: userInfo.schoolId,
      author: `${userInfo.firstName} ${userInfo.lastName}`,
      date: new Date(),
      pi_visible: comment.visibleToPI,
      reviewer_visible: comment.visibleToReviewers
    }, 'id').then(() => {
      let statements = [
        retrieveComments(dbInfo, userInfo.schoolId, comment.disclosureId)
      ];
      if (comment.visibleToPI) {
        statements.push(
          flagPIReviewNeeded(dbInfo, comment.disclosureId, comment.topicSection, comment.topicId)
        );
      }
      return Promise.all(statements);
    });
};

let getDisclosure = (knex, userInfo, disclosureId) => {
  let criteria = {
    'id': disclosureId
  };

  if (userInfo.coiRole !== COIConstants.ROLES.ADMIN) {
    criteria.user_id = userInfo.schoolId;
  }

  return knex.select('de.id', 'de.type_cd as typeCd', 'de.title', 'de.disposition_type_cd as dispositionTypeCd', 'de.status_cd as statusCd', 'de.submitted_by as submittedBy', 'de.submitted_date as submittedDate', 'de.revised_date as revisedDate', 'de.start_date as startDate', 'de.expired_date as expiredDate', 'de.last_review_date as lastReviewDate', 'de.config_id as configId')
    .from('disclosure as de')
    .where(criteria);
};

export let get = (dbInfo, userInfo, disclosureId) => {
  var disclosure;
  let knex = getKnex(dbInfo);

  return Promise.all([
    getDisclosure(knex, userInfo, disclosureId),
    knex.select('e.id', 'e.disclosure_id as disclosureId', 'e.active', 'e.name', 'e.description')
      .from('fin_entity as e')
      .where('disclosure_id', disclosureId)
      .andWhereNot('status', COIConstants.RELATIONSHIP_STATUS.PENDING),
    knex.select('qa.id as id', 'qa.question_id as questionId', 'qa.answer as answer')
      .from('disclosure_answer as da')
      .innerJoin('questionnaire_answer as qa', 'qa.id', 'da.questionnaire_answer_id')
      .where('da.disclosure_id', disclosureId),
    knex.select('d.id as id', 'd.project_id as projectId', 'd.fin_entity_id as finEntityId', 'd.type_cd as typeCd', 'd.comments as comments', 'p.title as projectTitle', 'fe.name as entityName', 'p.type_cd as projectTypeCd', 'p.sponsor_name as sponsorName', 'pp.role_cd as roleCd', 'fe.active as finEntityActive')
      .from('declaration as d')
      .innerJoin('fin_entity as fe', 'fe.id', 'd.fin_entity_id')
      .innerJoin('project as p', 'p.id', 'd.project_id')
      .innerJoin('project_person as pp', 'pp.project_id', 'p.id')
      .innerJoin('disclosure as di', 'di.user_id', 'pp.person_id')
      .where('d.disclosure_id', disclosureId),
    retrieveComments(dbInfo, userInfo.schoolId, disclosureId),
    knex.select('id', 'name', 'key')
      .from('file')
      .where({
        ref_id: disclosureId,
        file_type: COIConstants.FILE_TYPE.DISCLOSURE
      }),
    knex.select('id', 'name', 'key')
      .from('file')
      .where({
        ref_id: disclosureId,
        file_type: COIConstants.FILE_TYPE.MANAGEMENT_PLAN
      }),
    isDisclosureUsers(dbInfo, disclosureId, userInfo.schoolId)
  ]).then(([
      disclosureRecords,
      entityRecords,
      answerRecords,
      declarationRecords,
      commentRecords,
      fileRecords,
      managementPlans,
      isOwner
    ]) => {
      if (userInfo.coiRole !== COIConstants.ROLES.ADMIN) {
        if (!isOwner) {
          throw Error(`Attempt by ${userInfo.username} to load disclosure ${disclosureId} which is not theirs`);
        }
      }

      disclosure = disclosureRecords[0];
      disclosure.entities = entityRecords;
      disclosure.answers = answerRecords;
      disclosure.declarations = declarationRecords;
      disclosure.comments = commentRecords;
      disclosure.files = fileRecords;
      disclosure.managementPlan = managementPlans;
      disclosure.answers.forEach(answer =>{
        answer.answer = JSON.parse(answer.answer);
      });

      return Promise.all([
        knex.select('r.id', 'r.fin_entity_id as finEntityId', 'r.relationship_cd as relationshipCd', 'r.person_cd as personCd', 'r.type_cd as typeCd', 'r.amount_cd as amountCd', 'r.comments')
          .from('relationship as r')
          .whereIn('fin_entity_id', disclosure.entities.map(entity => { return entity.id; }))
          .andWhereNot('status', COIConstants.RELATIONSHIP_STATUS.PENDING)
          .then(relationships => {
            return knex('travel_relationship')
              .select('amount', 'destination', 'start_date as startDate', 'end_date as endDate', 'reason', 'relationship_id as relationshipId')
              .whereIn('relationship_id', relationships.map(relationship => { return relationship.id; }))
              .then(travels=> {
                disclosure.entities.forEach(entity => {
                  entity.relationships = relationships.filter(relationship => {
                    return relationship.finEntityId === entity.id;
                  }).map(relationship=> {
                    let travel = travels.find(item => {
                      return item.relationshipId === relationship.id;
                    });
                    relationship.travel = travel ? travel : {};
                    return relationship;
                  });
                });
              });
          }),
        knex.select('qa.question_id as questionId', 'qa.answer as answer', 'fea.fin_entity_id as finEntityId')
          .from('questionnaire_answer as qa' )
          .innerJoin('fin_entity_answer as fea', 'fea.questionnaire_answer_id', 'qa.id')
          .whereIn('fea.fin_entity_id', disclosure.entities.map(entity => { return entity.id; }))
          .then(answers=>{
            disclosure.entities.forEach(entity => {
              entity.answers = answers.filter(answer => {
                return answer.finEntityId === entity.id;
              }).map(answer=>{
                answer.answer = JSON.parse(answer.answer);
                return answer;
              });
            });
          }),
        knex.select('*')
          .from('file')
          .whereIn('ref_id', disclosure.entities.map(entity => { return entity.id; }))
          .andWhere('file_type', COIConstants.FILE_TYPE.FINANCIAL_ENTITY)
          .then(files=>{
            disclosure.entities.forEach(entity => {
              entity.files = files.filter(file => {
                return file.ref_id === entity.id;
              });
            });
          })
      ]).then(()=>{
        return disclosure;
      });
    });
};

export let getAnnualDisclosure = (dbInfo, userInfo, piName) => {
  let knex = getKnex(dbInfo);
  return knex('disclosure').select('id as id').where('type_cd', 2).andWhere('user_id', userInfo.schoolId)
    .then(result => {
      if (result.length < 1) {
        return knex('config').max('id as id')
        .then(config => {
          let newDisclosure = {
            type_cd: 2,
            status_cd: 1,
            start_date: new Date(),
            user_id: userInfo.schoolId,
            submitted_by: piName,
            config_id: config[0].id
          };
          return knex('disclosure')
            .insert(newDisclosure, 'id')
            .then(id => {
              newDisclosure.id = id[0];
              newDisclosure.answers = [];
              newDisclosure.entities = [];
              newDisclosure.declarations = [];
              return camelizeJson(newDisclosure);
            });
        });
      }
      else {
        return get(dbInfo, userInfo, result[0].id);
      }
    });
};

export let getSummariesForReviewCount = (dbInfo, filters) => {
  let knex = getKnex(dbInfo);

  let query = knex('disclosure').count('id as rowcount')
    .innerJoin('disclosure_type', 'disclosure_type.type_cd', 'disclosure.type_cd');

  if (filters.date) {
    if (filters.date.start && !isNaN(filters.date.start)) {
      query.where(function() {
        this.where(function() {
          this.whereNotNull('revised_date')
            .andWhere('revised_date', '>=', new Date(filters.date.start));
        });
        this.orWhere(function() {
          this.whereNull('revised_date')
            .andWhere('submitted_date', '>=', new Date(filters.date.start));
        });
      });
    }

    if (filters.date.end && !isNaN(filters.date.end)) {
      query.where(function() {
        this.where(function() {
          this.whereNotNull('revised_date')
            .andWhere('revised_date', '<=', new Date(filters.date.end + ONE_DAY));
        });
        this.orWhere(function() {
          this.whereNull('revised_date')
            .andWhere('submitted_date', '<=', new Date(filters.date.end + ONE_DAY));
        });
      });
    }
  }
  if (filters.status && filters.status.length > 0) {
    query.whereIn('disclosure.status_cd', filters.status);
  }
  if (filters.type && filters.type.length > 0) {
    query.whereIn('disclosure_type.description', filters.type);
  }
  if (filters.submittedBy) {
    query.where('submitted_by', filters.submittedBy);
  }
  if (filters.search) {
    query = query.where(function() {
      this.where('submitted_by', 'like', '%' + filters.search + '%');
         // .orWhere('disclosure_type.description', 'like', '%' + filters.search + '%')
    });
  }

  return query;
};

const SUMMARY_PAGE_SIZE = 40;
export let getSummariesForReview = (dbInfo, sortColumn, sortDirection, start, filters) => {
  let knex = getKnex(dbInfo);

  let query = knex('disclosure').select('submitted_by', 'revised_date', 'disclosure.status_cd as statusCd', 'disclosure_type.description as type', 'id', 'submitted_date')
    .innerJoin('disclosure_type', 'disclosure_type.type_cd', 'disclosure.type_cd');

  if (filters.date) {
    if (filters.date.start && !isNaN(filters.date.start)) {
      query.where(function() {
        this.where(function() {
          this.whereNotNull('revised_date')
            .andWhere('revised_date', '>=', new Date(filters.date.start));
        });
        this.orWhere(function() {
          this.whereNull('revised_date')
            .andWhere('submitted_date', '>=', new Date(filters.date.start));
        });
      });
    }

    if (filters.date.end && !isNaN(filters.date.end)) {
      query.where(function() {
        this.where(function() {
          this.whereNotNull('revised_date')
            .andWhere('revised_date', '<=', new Date(filters.date.end + ONE_DAY));
        });
        this.orWhere(function() {
          this.whereNull('revised_date')
            .andWhere('submitted_date', '<=', new Date(filters.date.end + ONE_DAY));
        });
      });
    }
  }
  if (filters.status && filters.status.length > 0) {
    query.whereIn('disclosure.status_cd', filters.status);
  }
  if (filters.type && filters.type.length > 0) {
    query.whereIn('disclosure_type.description', filters.type);
  }
  if (filters.submittedBy) {
    query.where('submitted_by', filters.submittedBy);
  }
  if (filters.search) {
    query.where(function() {
      this.where('submitted_by', 'like', '%' + filters.search + '%');
         // .orWhere('disclosure_type.description', 'like', '%' + filters.search + '%')
    });
  }

  let dbSortColumn;
  let dbSortDirection = sortDirection === 'DESCENDING' ? 'desc' : undefined;
  switch (sortColumn) {
    case 'SUBMITTED_DATE':
      dbSortColumn = 'submitted_date';
      break;
    case 'STATUS':
      dbSortColumn = 'statusCd';
      break;
    case 'TYPE':
      dbSortColumn = 'type';
      break;
    default:
      dbSortColumn = 'submitted_by';
      break;
  }

  query.orderBy(dbSortColumn, dbSortDirection);
  query.orderBy('id', 'desc');
  return query.limit(SUMMARY_PAGE_SIZE).offset(+start);
};

export let getSummariesForUser = (dbInfo, userId) => {
  let knex = getKnex(dbInfo);
  return knex.select('expired_date', 'type_cd as type', 'title', 'status_cd as status', 'last_review_date', 'id')
    .from('disclosure as d')
    .where('d.user_id', userId);
};

let updateEntitiesAndRelationshipsStatuses = (knex, disclosureId, oldStatus, newStatus) => {
  return knex('fin_entity')
  .update({status: newStatus})
  .where('disclosure_id', disclosureId)
  .andWhere('status', oldStatus)
  .then(()=>{
    return knex('fin_entity')
    .select('id')
    .where('disclosure_id', disclosureId)
    .then(results => {
      return Promise.all(
      results.map(result => {
        let update = {};
        update.status = newStatus;
        if (newStatus === COIConstants.RELATIONSHIP_STATUS.DISCLOSED) {
          update.disclosed_date = new Date();
        }

        return knex('relationship')
        .update(update)
        .where('fin_entity_id', result.id)
        .andWhere('status', oldStatus);
      })
      );
    });
  });
};

let updateStatus = (knex, name, disclosureId) => {
  return knex('disclosure')
  .update({
    status_cd: COIConstants.DISCLOSURE_STATUS.SUBMITTED_FOR_APPROVAL,
    submitted_by: name,
    submitted_date: new Date()
  })
  .where('id', disclosureId);
};

export let submit = (dbInfo, userInfo, disclosureId) => {
  return isDisclosureUsers(dbInfo, disclosureId, userInfo.schoolId)
    .then(isSubmitter => {
      if (!isSubmitter) {
        throw Error(`Attempt by ${userInfo.username} to submit disclosure ${disclosureId} which isnt theirs`);
      }

      let knex = getKnex(dbInfo);
      return Promise.all([
        updateStatus(knex, userInfo.name, disclosureId),
        updateEntitiesAndRelationshipsStatuses(knex, disclosureId, COIConstants.RELATIONSHIP_STATUS.IN_PROGRESS, COIConstants.RELATIONSHIP_STATUS.DISCLOSED)
      ]);
    });
};

export let getExpirationDate = (approvedDate, isRolling, dueDate) => {
  if (isRolling === true) {
    return new Date(approvedDate.setFullYear(approvedDate.getFullYear() + 1));
  } else {
    let dueMonthDay = dueDate.getMonth() + dueDate.getDay();
    let approveMonthDay = approvedDate.getMonth() + approvedDate.getDay();

    if (approveMonthDay < dueMonthDay) {
      return new Date(dueDate.setFullYear(approvedDate.getFullYear()));
    } else {
      return new Date(dueDate.setFullYear(approvedDate.getFullYear() + 1));
    }
  }
};

let approveDisclosure = (knex, disclosureId, expiredDate) => {
  return knex('disclosure')
    .update({
      expired_date: expiredDate,
      status_cd: COIConstants.DISCLOSURE_STATUS.UP_TO_DATE,
      last_review_date: new Date()
    })
    .where('id', disclosureId);
};

let archiveDisclosure = (knex, disclosureId, approverName, disclosure) => {
  return knex('disclosure_archive')
    .insert({
      disclosure_id: disclosureId,
      approved_date: new Date(),
      approved_by: approverName,
      disclosure: JSON.stringify(disclosure)
    }, 'id');
};

let deleteComments = (knex, disclosureId) => {
  return knex('comment')
    .del()
    .where('disclosure_id', disclosureId);
};

let deleteAnswersForDisclosure = (knex, disclosureId) => {
  return knex('disclosure_answer').select('questionnaire_answer_id').where('disclosure_id', disclosureId)
    .then((result) => {
      return knex('disclosure_answer').del().where('disclosure_id', disclosureId)
        .then(() => {
          let idsToDelete = result.map(disclosureAnswer => {
            return disclosureAnswer.questionnaire_answer_id;
          });
          return knex('questionnaire_answer').del().whereIn('id', idsToDelete);
        });
    });
};

let deletePIReviewsForDisclsoure = (knex, disclosureId) => {
  return knex('pi_review')
    .del()
    .where('disclosure_id', disclosureId);
};

export let approve = (dbInfo, disclosure, displayName, disclosureId) => {
  let knex = getKnex(dbInfo);

  disclosure.statusCd = COIConstants.DISCLOSURE_STATUS.UP_TO_DATE;
  disclosure.lastReviewDate = new Date();

  return Promise.all([
    knex('config').select('config').limit(1).orderBy('id', 'desc'),
    archiveDisclosure(knex, disclosureId, displayName, disclosure),
    deleteComments(knex, disclosureId),
    deleteAnswersForDisclosure(knex, disclosureId),
    deletePIReviewsForDisclsoure(knex, disclosureId),
    updateEntitiesAndRelationshipsStatuses(knex, disclosureId, COIConstants.RELATIONSHIP_STATUS.PENDING, COIConstants.RELATIONSHIP_STATUS.IN_PROGRESS)
  ])
  .then(([config]) => {
    let generalConfig = JSON.parse(config[0].config).general;
    let approvedDate = new Date();
    let expiredDate = getExpirationDate(approvedDate, generalConfig.isRollingDueDate, new Date(generalConfig.dueDate));
    return approveDisclosure(knex, disclosureId, expiredDate);
  });
};

export let reject = (dbInfo, displayName, disclosureId) => {
  let knex = getKnex(dbInfo);
  return knex('disclosure')
  .update({
    status_cd: COIConstants.DISCLOSURE_STATUS.UPDATES_REQUIRED,
    last_review_date: new Date()
  })
  .where('id', disclosureId);
};

export let getArchivedDisclosures = (dbInfo, userId) => {
  let knex = getKnex(dbInfo);

  return Promise.all([
    knex.select('da.id', 'da.disclosure_id as disclosureId', 'da.approved_by as approvedBy', 'da.approved_date as approvedDate', 'da.disclosure as disclosure')
      .from('disclosure_archive as da')
      .innerJoin('disclosure as d', 'd.id', 'da.disclosure_id')
      .where('d.user_id', userId)
      .orderBy('da.id', 'desc'),
    knex.select('id', 'config')
      .from('config as c')
  ]).then(([archives, configs]) => {
    archives.forEach(archive => {
      let archivesConfigId = JSON.parse(archive.disclosure).configId;
      let theConfig = configs.find(config => {
        return config.id === archivesConfigId;
      });

      if (theConfig) {
        archive.config = theConfig.config;
      }
    });

    return archives;
  });
};

export let getLatestArchivedDisclosure = (dbInfo, userId, disclosureId) => {
  let knex = getKnex(dbInfo);
  return knex.select('disclosure')
  .from('disclosure_archive')
  .where('disclosure_id', disclosureId)
  .limit(1)
  .orderBy('approved_date', 'desc');
};

export let deleteAnswers = (dbInfo, userInfo, disclosureId, answersToDelete) => {
  let knex = getKnex(dbInfo);

  return isDisclosureUsers(dbInfo, disclosureId, userInfo.schoolId)
    .then(isSubmitter => {
      if (!isSubmitter) {
        throw Error(`Attempt by ${userInfo.username} to delete answers from disclosure ${disclosureId} which isnt theirs`);
      }

      return knex.select('qa.id as questionnaireAnswerId', 'da.id as disclosureAnswerId')
        .from('disclosure_answer as da')
        .innerJoin('questionnaire_answer as qa', 'qa.id', 'da.questionnaire_answer_id')
        .whereIn('qa.question_id', answersToDelete)
        .andWhere('da.disclosure_id', disclosureId)
        .then(results => {
          let questionnaireAnswerIds = results.map(row => {
            return row.questionnaireAnswerId;
          });
          let disclosureAnswerIds = results.map(row => {
            return row.disclosureAnswerId;
          });

          return knex('disclosure_answer')
            .whereIn('id', disclosureAnswerIds)
            .del()
            .then(() => {
              return knex('questionnaire_answer')
                .whereIn('id', questionnaireAnswerIds)
                .del()
                .then(() => { return; });
            });
        });
    });
};
