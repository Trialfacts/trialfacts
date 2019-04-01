logging = false
weightlowerlimit = tonumber(getvalue(189))
weightupperlimit = tonumber(getvalue(188))
weightpassfailqid = 190
weightqid = 118

if weightlowerlimit == nil then
  weightlowerlimit = 0
end

if weightupperlimit == nil then
  weightupperlimit = 700
end

function log(var)
  if logging == true then
    print(var)
  end
end

log("start")
log("weightlow: " .. weightlowerlimit)
log("weighthigh: " .. weightupperlimit)

-- SCRIPT --

weight = tonumber(getvalue(weightqid))

if weight == nil then
  log("weight missing")
  return
end

log("weight: " .. weight)

if (weight >= weightlowerlimit and weight <= weightupperlimit) then
  setvalue(weightpassfailqid, "Pass")
  log("pass")
elseif (weight < weightlowerlimit or weight > weightupperlimit) then
  setvalue(weightpassfailqid, "Fail")
  log("fail")
end