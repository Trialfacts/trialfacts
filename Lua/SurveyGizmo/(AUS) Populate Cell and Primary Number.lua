q20 = sgapiGetValue(20) --[[ Primary contact number field ]]
q21 = sgapiGetValue(21) --[[ Mobile field ]]
q121 = sgapiGetValue(121) --[[ Primary contact number type dropdown ]]
primarynumberqid = 123 --[[ Primary contact number hidden field to be populated ]]
mobilenumberqid = 122 --[[ cell hidden field to be populated ]]

if (q121 == "Mobile") then
  sgapiSetValue(primarynumberqid, q20)
  sgapiSetValue(mobilenumberqid, q20)
else
  sgapiSetValue(primarynumberqid, q20)
  sgapiSetValue(mobilenumberqid, q21)
end