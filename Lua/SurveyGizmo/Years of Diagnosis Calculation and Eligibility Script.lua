logging = false
diagnosisdate = 200
hiddenyearsid = 219 -- Hidden field years
yearspassfailid = 221


--function round(num, numDecimalPlaces)
 -- return tonumber(string.format("%." .. (numDecimalPlaces or 0) .. "f", num))
--end

function log(var)
  if logging == true then
    print(var)
  end
end

log("start")

diagdate = getvalue(diagnosisdate)

if diagdate == nil or diagdate == false then
  log("diagnosis date missing")
  return
end

month, year = string.match(diagdate, "(%d+)/(%d+)")
log("month: " .. month)
log("year: " .. year)
year1 = tonumber(month)/12 + tonumber(year)
log("year1: " .. year1)

format= "Y-m-d"
today = date(format)
log("today : " .. today)
year2, month2, day2 = string.match(today,"(%d+)-(%d+)-(%d+)")
year2 = tonumber(month2)/12 + tonumber(year2)
log("year2: " .. year2)
log ("month2: " .. month2)
log("year2: " .. year2)

years = year2 - year1
log("years: " .. years)

setvalue(hiddenyearsid, years)

if (years < 10) then
  setvalue(yearspassfailid, "Pass")
  log("pass")
elseif (years >= 10) then
  setvalue(yearspassfailid, "Fail")
  log("fail")
end

