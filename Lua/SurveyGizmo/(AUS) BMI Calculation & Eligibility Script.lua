logging = false
bmilowerlimit = tonumber(getvalue(140))
bmiupperlimit = tonumber(getvalue(141))
hidvalqid = 119
bmipassfailqid = 143
heightqid = 117
weightqid = 118

if bmilowerlimit == nil then
  bmilowerlimit = 0
end

if bmiupperlimit == nil then
  bmiupperlimit = 150
end

function round(num, numDecimalPlaces)
  return tonumber(string.format("%." .. (numDecimalPlaces or 0) .. "f", num))
end

function log(var)
  if logging == true then
    print(var)
  end
end

log("start")
log("bmilow: " .. bmilowerlimit)
log("bmihigh: " .. bmiupperlimit)

-- SCRIPT --

height = tonumber(getvalue(heightqid))
weight = tonumber(getvalue(weightqid))

if height == nil then
  log("height missing")
  return
end

if weight == nil then
  log("weight missing")
  return
end

bmi = (weight / height / height * 10000)

bmitotal = round(bmi, 2)

log("bmi: " .. bmitotal)

setvalue(hidvalqid, bmitotal)

if (bmitotal >= bmilowerlimit and bmitotal <= bmiupperlimit) then
  setvalue(bmipassfailqid, "Pass")
  log("pass")
elseif (bmitotal < bmilowerlimit or bmitotal > bmiupperlimit) then
  setvalue(bmipassfailqid, "Fail")
  log("fail")
end
