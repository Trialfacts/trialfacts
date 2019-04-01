hidvalqid = 155
systemdateandtime = 73

dateandtime = getvalue(systemdateandtime)
unixtimestamp = strtotime(dateandtime) --[[ Convert date and time to unix time stamp ]]

unixtimestamp = (unixtimestamp + 50400) --[[ Change the date by the number of seconds eg. adding 14 hours = 60 x 60 x 14 = 50400 ]]

audate = date("d/m/Y H:i", unixtimestamp) --[[ Convert unix time stamp to date and time eg. 25/12/2015 1:43 pm ]]

setvalue(hidvalqid, audate)