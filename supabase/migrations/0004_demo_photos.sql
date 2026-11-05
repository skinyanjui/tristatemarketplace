-- Real photos for seven demo listings (files live in public/listings). The sedan photo is a Ford Fusion, so that listing was retitled to match.
update public.tm_listings set photos = case id
 when 'camry' then array['/listings/car-sedan.jpg']
 when 'estate-evv' then array['/listings/estate-sale.jpg']
 when 'ranch-newburgh' then array['/listings/ranch-home.jpg']
 when 'maker-market' then array['/listings/maker-market.jpg']
 when 'pasture-posey' then array['/listings/pasture.jpg']
 when 'angus-heifer' then array['/listings/angus-heifer.jpg']
 when 'multi-family' then array['/listings/yard-sale.jpg'] end
where id in ('camry','estate-evv','ranch-newburgh','maker-market','pasture-posey','angus-heifer','multi-family');
update public.tm_listings set title = '2015 Ford Fusion Titanium, one owner', price = '$11,900',
 description = 'One-owner Fusion Titanium in charcoal gray with leather seats and full service records. Clean title, new tires last spring, no accidents.',
 details = '[["Year","2015"],["Mileage","68,000"],["Transmission","Automatic"],["Title","Clean"]]' where id = 'camry';
