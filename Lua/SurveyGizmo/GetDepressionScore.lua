logging = false

function log(var)
    if logging == true then
        print(var)
    end
end

log("Script Start")
Q1 = getvalue(212)
Q2 = getvalue(213)
Q3 = getvalue(242)
Q4 = getvalue(243)
Q5 = getvalue(244)
Q6 = getvalue(245)
Q7 = getvalue(246)
Q8 = getvalue(247)
Q9 = getvalue(248)
Q10 = getvalue(249)
Q11 = getvalue(250)
Q12 = getvalue(251)
Q13 = getvalue(252)
Q14 = getvalue(253)
Q15 = getvalue(254)
Q16 = getvalue(255)
Q17 = getvalue(256)
Q18 = getvalue(257)
Q19 = getvalue(258)
Q20 = getvalue(259)
Q21 = getvalue(260)
Q22 = getvalue(261)
Q23 = getvalue(262)
Q24 = getvalue(263)
Q25 = getvalue(264)
Q26 = getvalue(265)
Q27 = getvalue(266)
Q28 = getvalue(267)
Q29 = getvalue(268)
Q30 = getvalue(269)
scoreid = 270
levelid = 271
 
dscore = 0
  
if (Q1 == "No") then
  dscore = dscore + 1
end

if (Q2 == "Yes") then
  dscore = dscore + 1
end
  
if (Q3 == "Yes") then
  dscore = dscore + 1
end
  
if (Q4 == "Yes") then
  dscore = dscore + 1
end
  
if (Q5 == "No") then
  dscore = dscore + 1
end
  
if (Q6 == "Yes") then
  dscore = dscore + 1
end
  
if (Q7 == "No") then
  dscore = dscore + 1
end
  
if (Q8 == "Yes") then
  dscore = dscore + 1
end
  
if (Q9 == "No") then
  dscore = dscore + 1
end
  
if (Q10 == "Yes") then
  dscore = dscore + 1
end
  
if (Q11 == "Yes") then
  dscore = dscore + 1
end
  
if (Q12 == "Yes") then
  dscore = dscore + 1
end
  
if (Q13 == "Yes") then
  dscore = dscore + 1
end
  
if (Q14 == "Yes") then
  dscore = dscore + 1
end
  
if (Q15 == "No") then
  dscore = dscore + 1
end
  
if (Q16 == "Yes") then
  dscore = dscore + 1
end
  
if (Q17 == "Yes") then
  dscore = dscore + 1
end
  
if (Q18 == "Yes") then
  dscore = dscore + 1
end
  
if (Q19 == "No") then
  dscore = dscore + 1
end
  
if (Q20 == "Yes") then
  dscore = dscore + 1
end
  
if (Q21 == "No") then
  dscore = dscore + 1
end
  
if (Q22 == "Yes") then
  dscore = dscore + 1
end
  
if (Q23 == "Yes") then
  dscore = dscore + 1
end
  
if (Q24 == "Yes") then
  dscore = dscore + 1
end
  
if (Q25 == "Yes") then
  dscore = dscore + 1
end
  
if (Q26 == "Yes") then
  dscore = dscore + 1
end
  
if (Q27 == "No") then
  dscore = dscore + 1
end
  
if (Q28 == "Yes") then
  dscore = dscore + 1
end
  
if (Q29 == "No") then
  dscore = dscore + 1
end
  
if (Q30 == "No") then
  dscore = dscore + 1
end
  
setvalue(scoreid, dscore)
  
log(dscore)
  
if dscore <= 9 then
setvalue(levelid,"Normal")
log("normal")
elseif dscore <= 19 then
setvalue(levelid,"Mild Depressive")
log("mild depressive")
elseif dscore <= 30 then
setvalue (levelid, "Severe Depressive")
log("severe depressive")
end
