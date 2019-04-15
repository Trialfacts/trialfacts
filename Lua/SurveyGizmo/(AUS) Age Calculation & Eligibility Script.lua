logging = false
dobqid = 32 -- Text field Question ID
agehiddenfieldqid = 150 --[[ Hidden field with age in years ]]
agelowerlimit = tonumber(getvalue(153))
ageupperlimit = tonumber(getvalue(154))
agepassfailqid = 152

if agelowerlimit == nil then
  agelowerlimit = 0
end

if ageupperlimit == nil then
  ageupperlimit = 150
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

birthdate = getvalue(dobqid)

if birthdate == nil or birthdate == false then
  log("birthdate missing")
  return
-- birthdate = "09/02/1986"
end

birthdate_unix = strtotime(str_replace("/", "-", birthdate))

today = date("Y-m-d")
today_unix = strtotime(today)
age_unix = today_unix - birthdate_unix
age_years = (age_unix / 60 / 60 / 24 / 365) --[[ Convert seconds to years ]]
age_years = round(age_years, 2)
log("age: " .. age_years)
log("agelow: " .. agelowerlimit)
log("agehigh: " .. ageupperlimit)

setvalue(agehiddenfieldqid, age_years)

if (age_years >= agelowerlimit and age_years <= ageupperlimit) then
  setvalue(agepassfailqid, "Pass")
  log("pass")
elseif (age_years < agelowerlimit or age_years > ageupperlimit) then
  setvalue(agepassfailqid, "Fail")
  log("fail")
end