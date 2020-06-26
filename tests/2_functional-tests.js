/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const Issue = require('../models/issueModel');

chai.use(chaiHttp);

// Test helper functions

async function createTest(done, issue_title, callback) {
  try {
    let newIssue = new Issue({
      issue_title,
      issue_text: "test-text",
      created_by: "test-created-by"
    })

    let issue = await newIssue.save()
    
    if (issue) {
      console.log(`Created test issue: ${issue}`)
      if (callback) callback(issue._id)
      done();

    } else {
      console.log(`Cannot create test issue with attr: ${newIssue}`)
      done();
    }
  } catch (error) {
    console.log(`Error creating test issue: ${error}`)  
    done();  
  }
}


async function deleteTest(done, search_param) {
  try {
    let deletedIssue = await Issue.findOneAndDelete({ search_param });
    if (deletedIssue) {
      console.log(`Test issue deleted.`);
      done();
    } else {
      console.log("Deleting failed.")
    }
  } catch (error) {
    console.log(`Error in deleting proccess: ${error}`);
    done();            
  }          
}

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {

      afterEach(done => {
        deleteTest(done, { issue_title: "Title" })
      })

      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.equal(res.body.open, true);           
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in'
          })
          .end(function(err, res){
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'text');
            assert.equal(res.body.created_by, 'Functional Test - Required fields filled in');
            assert.equal(res.body.assigned_to, "");
            assert.equal(res.body.status_text, "");
            assert.equal(res.body.open, true); 
          })
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            created_by: 'Functional Test - Missing required fields'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, "message");
            assert.propertyVal(res.body, "message", "missing required fields.") 
          })
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      let test_id;      
      
      before(done => {
        createTest(done, "Title", (id) => {
          test_id = id;
          return;
        })
      });

      after(done => {
        deleteTest(done, { _id: test_id })
      })
           

      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: test_id
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, "message");
            assert.propertyVal(res.body, "message", "no updated field sent.")
            done()
          })
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: test_id,
          issue_title: "New Title"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, "message");
          assert.propertyVal(res.body, "message", `Issue with _id: ${test_id} successfully updated.`)
          done()
        })
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: test_id,
          issue_title: "New Title",
          issue_text: "New text"
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, "message");
          assert.propertyVal(res.body, "message", `Issue with _id: ${test_id} successfully updated.`)
          done()
        })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      before(done => {
        createTest(done, "Title")
      });

      after(done => {
        deleteTest(done, { issue_title: "Title" })
      });

      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ issue_text: "test-text" })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({ 
          issue_text: "test-text",
          created_by: "test-created-by"
         })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      let test_id;      
      
      before(done => {
        createTest(done, "Title", (id) => {
          test_id = id;
          return;
        })
      });
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "message");
          assert.propertyVal(res.body, "message", `No supplied _id.`)
        })        
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete(`/api/issues/test/${test_id}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "message");
          assert.propertyVal(res.body, "message", `Issue: ${test_id} deleted.`)
        })    
      });
      
    });

});
