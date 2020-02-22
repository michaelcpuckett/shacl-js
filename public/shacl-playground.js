/*
  Copied and forked with permission from Holger Knublauch <holger@topquadrant.com>
  https://github.com/TopQuadrant/shacl-js/pull/25#issuecomment-589890798
*/

/* Copyright (C) TopQuadrant, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Holger Knublauch <holger@topquadrant.com>, 2017
 */

// This is rather messy code to drive the SHACL Playground.

var results;

var dataGraphURI = "urn:x-shacl:dataGraph";

var shapesGraphURI = "urn:x-shacl:shapesGraph";

var validationError;

var examples = {
	
	personsTTL : {
		dataFormat : "text/turtle",
		data : '@prefix ex: <http://example.org/ns#> .\n\
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\
@prefix schema: <http://schema.org/> .\n\
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\
\n\
ex:Bob\n\
    a schema:Person ;\n\
    schema:givenName "Robert" ;\n\
    schema:familyName "Junior" ;\n\
    schema:birthDate "1971-07-07"^^xsd:date ;\n\
    schema:deathDate "1968-09-10"^^xsd:date ;\n\
    schema:address ex:BobsAddress .\n\
\n\
ex:BobsAddress\n\
    schema:streetAddress "1600 Amphitheatre Pkway" ;\n\
    schema:postalCode 9404 .',
		shapesFormat : "text/turtle",
		shapes : '@prefix dash: <http://datashapes.org/dash#> .\n\
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n\
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\
@prefix schema: <http://schema.org/> .\n\
@prefix sh: <http://www.w3.org/ns/shacl#> .\n\
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\
\n\
schema:PersonShape\n\
    a sh:NodeShape ;\n\
    sh:targetClass schema:Person ;\n\
    sh:property [\n\
        sh:path schema:givenName ;\n\
        sh:datatype xsd:string ;\n\
        sh:name "given name" ;\n\
    ] ;\n\
    sh:property [\n\
        sh:path schema:birthDate ;\n\
        sh:lessThan schema:deathDate ;\n\
        sh:maxCount 1 ;\n\
    ] ;\n\
    sh:property [\n\
        sh:path schema:gender ;\n\
        sh:in ( "female" "male" ) ;\n\
    ] ;\n\
    sh:property [\n\
        sh:path schema:address ;\n\
        sh:node schema:AddressShape ;\n\
    ] .\n\
\n\
schema:AddressShape\n\
    a sh:NodeShape ;\n\
    sh:closed true ;\n\
    sh:property [\n\
        sh:path schema:streetAddress ;\n\
        sh:datatype xsd:string ;\n\
    ] ;\n\
    sh:property [\n\
        sh:path schema:postalCode ;\n\
        sh:or ( [ sh:datatype xsd:string ] [ sh:datatype xsd:integer ] ) ;\n\
        sh:minInclusive 10000 ;\n\
        sh:maxInclusive 99999 ;\n\
    ] .'
	},
	
	personsJSON : {
		
		data : '{\n\
    "@context": { "@vocab": "http://schema.org/" },\n\
\n\
    "@id": "http://example.org/ns#Bob",\n\
    "@type": "Person",\n\
    "givenName": "Robert",\n\
    "familyName": "Junior",\n\
    "birthDate": "1971-07-07",\n\
    "deathDate": "1968-09-10",\n\
    "address": {\n\
        "@id": "http://example.org/ns#BobsAddress",\n\
        "streetAddress": "1600 Amphitheatre Pkway",\n\
        "postalCode": 9404\n\
    }\n\
}',
		dataFormat : "application/ld+json",
		shapes : '',
		shapesFormat : "text/turtle"
	}
}

examples.personsJSON.shapes = examples.personsTTL.shapes;

function showExample(id) {
	$("#dataGraphArea").val(examples[id].data);
	$("#dataGraphTypeSelect").val(examples[id].dataFormat);
	$("#shapesGraphArea").val(examples[id].shapes);
	$("#shapesGraphTypeSelect").val(examples[id].shapesFormat);
}


$(function() {
	
	$("#dataExampleSelect").change(function() {
		var id = $(this).val();
		switchToDataExample(id);
	})
	
	showExample("personsJSON");

	$("#dataGraphButton").click(function() {
		showValidationResults();
	})
	$("#shapesGraphButton").click(function() {
		showValidationResults();
	})
})


function nodeLabel(node, store) {
	if(node.isURI()) {
		for(prefix in store.namespaces) {
			var ns = store.namespaces[prefix];
			if(node.value.indexOf(ns) == 0) {
				return prefix + ":" + node.value.substring(ns.length);
			}
		}
		return "<" + node.value + ">";
	}
	else if(node.isBlankNode()) {
		return "Blank node " + node.toString();
	}
	else {
		return "" + node;
	}
}


function showError(selector, message) {
	$(selector).html(message.toString());
	$(selector).addClass("statusError");
}


function showStatus(selector, message) {
	$(selector).html(message);
	$(selector).removeClass("statusError");
}


function showValidationResults() {
  const dataGraph = $("#dataGraphArea").val()
  const dataType = $("#dataGraphTypeSelect").val()
  const shapesGraph = $("#shapesGraphArea").val()
  const shapesType = $("#shapesGraphTypeSelect").val()
  const validator = new window.SHACLValidator()
  validator.validate(dataGraph, dataType, shapesGraph, shapesType, function (err, result) {
    if (err) {
      // $("#results-area-heading").css({'color': 'red'})
      $("#resultsArea").html("ERROR: " + JSON.stringify(err));
    } else {
      // $("#results-area-heading").css({'color': 'green'})
      $("#resultsArea").html(JSON.stringify(result.graph, null, 2));
    }
  })
}


function switchToDataExample(id) {
	var example = examples[id];
	$("#dataGraphTypeSelect").val(example.dataFormat);
	$("#dataGraphArea").val(example.data);
}
