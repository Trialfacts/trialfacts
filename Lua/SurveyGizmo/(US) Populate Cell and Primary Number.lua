q20 = getvalue(20) --[[ Primary contact number field ]]
q21 = getvalue(21) --[[ Cell field ]]
q121 = getvalue(121) --[[ Primary contact number type dropdown ]]
primarynumberqid = 123 --[[ Primary contact number hidden field to be populated ]]
cellnumberqid = 122 --[[ cell hidden field to be populated ]]

if (q121 == "Cell") then
  setvalue(primarynumberqid, q20)
  setvalue(cellnumberqid, q20)
else
  setvalue(primarynumberqid, q20)
  setvalue(cellnumberqid, q21)
end