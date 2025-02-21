function displayFields(form, customHTML){
	
	var numeroAtividadeAtual = getValue("WKNumState");

	if (numeroAtividadeAtual == 0) {
		var codigoSolicitante = getValue("WKUser");
		var constraint = DatasetFactory.createConstraint("colleaguePK.colleagueId", codigoSolicitante, codigoSolicitante, ConstraintType.MUST);
		var dataset = DatasetFactory.getDataset("colleague", null, [constraint], null);
		var name = dataset.getValue(0, "colleagueName");
		var email = dataset.getValue(0, "mail");

		form.setValue('requester_name', name);
		form.setValue('requester_mail', email);
		
		form.setEnabled('requester_name', false);
		form.setEnabled('requester_mail', false);
	}
}