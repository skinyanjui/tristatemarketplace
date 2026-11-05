-- Photos for ten more demo listings. Several photos did not match the original sample titles, so those listings were retitled.
update public.tm_listings set photos = array['/listings/ram-1500.jpg'], title = '2015 Ram 1500 crew cab with tonneau cover and running boards',
  description = 'Black crew cab Ram 1500 with a hard tonneau cover, chrome running boards and a clean interior. Runs strong, tows well.',
  details = '[["Year","2015"],["Mileage","96,000"],["Cab","Crew cab"],["Title","Clean"]]' where id = 'f150';
update public.tm_listings set photos = array['/listings/acoustic-night.jpg'] where id = 'acoustic-night';
update public.tm_listings set photos = array['/listings/boer-goats.jpg'] where id = 'boer-goats';
update public.tm_listings set photos = array['/listings/moving-sale.jpg'] where id = 'moving-sale';
update public.tm_listings set photos = array['/listings/street-sale.jpg'], title = 'Street-wide neighborhood sale: toys, clothing, glassware and decor',
  description = 'The whole street is selling. Clothing racks, kids toys, glassware, lamps and holiday decor on every lawn.' where id = 'neighborhood-sale';
update public.tm_listings set photos = array['/listings/yard-sale.jpg', '/listings/yard-sale-toys.jpg'] where id = 'multi-family';
update public.tm_listings set photos = array['/listings/cruiser.jpg'], title = 'Black touring cruiser with saddlebags, windshield and backrest, 12k miles',
  description = 'Garage kept cruiser with leather saddlebags, a detachable windshield and a passenger backrest. Chrome is clean. Clean title.',
  details = '[["Mileage","12,000"],["Type","Touring cruiser"],["Includes","Saddlebags, windshield"],["Title","Clean"]]' where id = 'harley';
update public.tm_listings set photos = array['/listings/bowrider.jpg'], title = 'Bowrider with blue bimini top and trailer, low hours',
  description = 'White and navy bowrider with a bimini top and a matching galvanized trailer. Low hours, winterized this week.',
  details = '[["Type","Bowrider"],["Hours","210"],["Includes","Trailer, bimini top"]]' where id = 'searay';
update public.tm_listings set photos = array['/listings/travel-trailer.jpg'], title = '22 ft travel trailer with tandem axle, ready to camp', price = '$17,500',
  description = 'Lightly used travel trailer with a tandem axle, entry steps, awning and a full kitchen. Sleeps six.',
  details = '[["Length","22 ft"],["Type","Travel trailer"],["Axles","2"],["Sleeps","6"]]' where id = 'cargo-trailer';
insert into public.tm_listings (id, seller_name, seller_meta, kind, title, place, price, condition, description, details, photos, is_demo)
values ('explorer', 'Tri-County Auto', 'Dealer', 'car', '2013 Ford Explorer XLT, three-row SUV', 'Princeton, IN', '$9,800', 'Used - Good',
  'Charcoal Explorer XLT with three rows of seating, roof rails and a clean interior. Serviced and ready to drive.',
  '[["Year","2013"],["Mileage","112,000"],["Seats","7"],["Title","Clean"]]', array['/listings/explorer.jpg'], true)
on conflict (id) do nothing;
