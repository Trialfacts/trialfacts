logging = false
bmilowerlimit = tonumber(getvalue(140))
bmiupperlimit = tonumber(getvalue(141))
hidvalqid = 119
bmipassfailqid = 143
heightftqid = 117
heightinqid = 118
weightqid = 127

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

feet = tonumber(getvalue(heightftqid))
heightinches = tonumber(getvalue(heightinqid))
weight = tonumber(getvalue(weightqid))

if feet == nil then
  log("feet missing")
  return
end

if heightinches == nil then
  log("heightinches missing")
  return
end

if weight == nil then
  log("weight missing")
  return
end

inches = feet * 12
height = inches + heightinches

bmi = weight / (height * height)
bmitotal = bmi * 703

bmitotal = round(bmitotal, 2)

log("bmi: " .. bmitotal)

setvalue(hidvalqid, bmitotal)

if (bmitotal >= bmilowerlimit and bmitotal <= bmiupperlimit) then
  setvalue(bmipassfailqid, "Pass")
  log("pass")
elseif (bmitotal < bmilowerlimit or bmitotal > bmiupperlimit) then
  setvalue(bmipassfailqid, "Fail")
  log("fail")
end