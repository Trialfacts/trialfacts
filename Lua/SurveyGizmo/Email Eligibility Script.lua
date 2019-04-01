email = "test1@test.com,test2@test.com" --[[ put all emails in this variable ]]
input = getvalue(19) --[[ replace 19 with email field ID ]]
id = 226 --[[ Pass/Fail ID for email script ]]

logging = false

function log(var)
    if logging == true then
        print(var)
    end
end

if (string.find(email, input, 1, plain) == nil) then
    log(string.find(email, input, 1, plain))
    log("Pass")
    setvalue(id, "Pass")
else
    log("Email found in variable.")
    log("Fail")
    setvalue(id, "Fail")
end
