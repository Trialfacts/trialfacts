q20 = getvalue(20) --[[ Primary contact number field ]]
q21 = getvalue(21) --[[ Mobile field ]]
q121 = getvalue(121) --[[ Primary contact number type dropdown ]]
primarynumberqid = 123 --[[ Primary contact number hidden field to be populated ]]
mobilenumberqid = 122 --[[ cell hidden field to be populated ]]

if (q121 == "Mobile") then
  setvalue(primarynumberqid, q20)
  setvalue(mobilenumberqid, q20)
else
  setvalue(primarynumberqid, q20)
  setvalue(mobilenumberqid, q21)
end