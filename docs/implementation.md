- on connect
	there is no session:
		create session id
		save session
		select first question from TB_CATEGORY_QUESTION
		send question to client
	there is a session:
		process_session:
			select all questions from TB_SESSION_QUESTION
			select upcoming question from TB_CATEGORY_QUESTION
			select all category items as suggestions from TB_CATEGORY_ITEM
			send question to client

- on send response
	get response
	save response in TB_SESSION_QUESTION_RESPONSES
	calculate available consultants
	if no more available consultants
		create report
		send report with chosen consultants to the client
	check if further questions available
		if yes
			go to process_session
		if no
			create report
			send report with chosen consultants to the client
			
		
		
		