- on connect
	there is no session:
		create session id
		save session
		select first question from TB_CATEGORY_QUESTION
		insert first question into TB_SESSION_QUESTION
		build state object
		send state to client
	there is a session:
		process_session:
			check if session exists
			select upcoming question from TB_CATEGORY_QUESTION
			send question to client
			build state object
			send state to client


- on send response
	get response
	save response in TB_SESSION_QUESTION_RESPONSES
	calculate available consultants
	if consultants less than threshold
		extract dimensions from candidates
		extract categories for each dimension
		assign each candidate to specific category in dimension
		send all info to client for interactive choice
	if further questions available
		go to process_session
	else
		create report
		send report with chosen consultants to the client


- select consultants
	create report

			
		
		
		