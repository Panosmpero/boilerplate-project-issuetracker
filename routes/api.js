/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const expect = require("chai").expect;
const Issue = require("../models/issueModel");
const { findByIdAndUpdate } = require("../models/issueModel");

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    /*
    =========================================
    ================ GET ====================
    =========================================
    */
    .get(async function (req, res) {
      console.log("get");

      try {
        const filters = req.query

        const searchKeys = Object.keys(filters)

        const issues = await Issue.find(filters, searchKeys)
        if (issues) {
          // console.log(`Issues found ${issues}.`)
          res.json(issues)

        } else {
          console.log("Cannot get issues at the moment.")
          res.json({ message: "Cannot get issues at the moment." })
        }
      } catch (error) {
        console.log(`Error getting issues ${error}.`)
        res.json({ message: `Error getting issues.` })
      }
      
      
    })
    /*
    =========================================
    ================ POST ===================
    =========================================
    */
    .post(async function (req, res) {
      try {
        console.log("post");

        const issue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
        });

        const newIssue = await issue.save();

        if (newIssue) {
          console.log(`New issue created: ${newIssue}.`);
          res.json({
            message: `New issue created.`,
            _id: newIssue._id,
            issue_title: newIssue.issue_title,
            issue_text: newIssue.issue_text,
            created_on: newIssue.created_on,
            updated_on: newIssue.updated_on,
            created_by: newIssue.created_by,
            open: newIssue.open,
            assigned_to: newIssue.assigned_to,
            status_text: newIssue.status_text,
          });

        } else {
          console.log(`Issue creation failed.`);
          res.json({ message: `Issue creation failed.` })
        }

      } catch (error) {
        console.log(`Error creating issue: ${error}.`);
        res.json({ message: "missing required fields." });
      }
    })
    /*
    =========================================
    ================ PUT ====================
    =========================================
    */
    .put(async function (req, res) {
      console.log("put");

      try {
        const fields = ["issue_title", "issue_text", "created_by", "assigned_to", "status_text", "open"]
        const updates = {}

        // If form field is subjected to change and
        // fields have values -> add them with their values to updates {}
        for (let key in req.body) {
          fields.forEach(field => {
            if (key === field && req.body[key].length > 0) updates[key] = req.body[key]
          })
        }
        const filledInputCount = Object.keys(updates).length
        
        // if there are fields filled other that _id => Update!
        if (filledInputCount > 0) {
          const _id = req.body._id;

          updates.updated_on = new Date();

          let issue = await Issue.findByIdAndUpdate(_id, updates, { new: true });

          if (issue) {
            console.log(`Issue with _id: ${issue._id} successfully updated.`)
            res.json({ message: `Issue with _id: ${issue._id} successfully updated.`, issue })
            
          } else {
            console.log(`Could not update issue with _id: ${_id}.`)
            res.json({ message: `Could not update issue with _id: ${_id}.` })
          }

        } else {
          console.log("no updated fields sent.")
          res.json({ message: "no updated field sent." })
        }

      } catch (error) {
        console.log(error);
        res.json({ message: "missing required fields." });
      }
    })
    /*
    =========================================
    ================ DELETE =================
    =========================================
    */
    .delete(async function (req, res) {
      console.log("delete");
      try {
        const { _id } = req.body;
        const issue = await Issue.findByIdAndDelete(_id)
        if (issue) {
          console.log(`Issue: ${issue._id} deleted.`)
          res.json({ message: `Issue: ${issue._id} deleted.`, issue })

        } else {
          console.log(`Could not delete issue with _id: ${_id}.`)
          res.json({ message: `Could not delete issue with _id: ${_id}.` })
        }

      } catch (error) {
        console.log(`_id Error. ${error}`);        
        res.json({ message: `No supplied _id.` })
      }
    });
};
