-- Tristate Market: schema. Lives in the shared Kazi Supabase project, so every object is prefixed tm_.
create table public.tm_listings (
  id text primary key default gen_random_uuid()::text,
  seller_id uuid references auth.users on delete cascade,
  seller_name text not null default '',
  seller_meta text not null default 'Private seller',
  kind text not null,
  title text not null check (char_length(title) between 3 and 140),
  place text not null,
  price text not null default '',
  condition text not null default '',
  description text not null default '',
  details jsonb not null default '[]',
  photos text[] not null default '{}',
  featured boolean not null default false,
  status text not null default 'active' check (status in ('active', 'sold', 'removed')),
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);
create index tm_listings_kind_idx on public.tm_listings (kind, created_at desc);
create index tm_listings_seller_idx on public.tm_listings (seller_id);

create table public.tm_saves (
  user_id uuid not null references auth.users on delete cascade,
  listing_id text not null references public.tm_listings on delete cascade,
  primary key (user_id, listing_id)
);

alter table public.tm_listings enable row level security;
alter table public.tm_saves enable row level security;

create policy "tm active listings are public" on public.tm_listings for select using (status = 'active' or auth.uid() = seller_id);
create policy "tm sellers insert own listings" on public.tm_listings for insert to authenticated
  with check (auth.uid() = seller_id and is_demo = false and featured = false);
create policy "tm sellers update own listings" on public.tm_listings for update to authenticated
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id and is_demo = false and featured = false);
create policy "tm sellers delete own listings" on public.tm_listings for delete to authenticated using (auth.uid() = seller_id);
create policy "tm own saves" on public.tm_saves for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('tm-listing-photos', 'tm-listing-photos', true) on conflict do nothing;
create policy "tm users upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'tm-listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "tm users delete own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'tm-listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Demo listings (is_demo = true). Remove them any time with: delete from public.tm_listings where is_demo;
insert into public.tm_listings (id, seller_name, seller_meta, kind, title, place, price, condition, description, details, created_at, is_demo) values
('camry', 'Dana W.', 'Private seller', 'car', '2019 Toyota Camry SE, one owner', 'Evansville, IN', '$18,500', 'Used - Excellent', 'One-owner Camry SE with full service records. Clean title, new tires last spring, no accidents.', '[["Year","2019"],["Mileage","42,000"],["Transmission","Automatic"],["Title","Clean"]]', now() - interval '0 days', true),
('estate-evv', 'Harper Estate Sales', 'Business', 'sale', 'Estate sale: mid-century furniture, records and vintage kitchenware', 'Evansville, IN', '$2 – $600', 'Used - Good', 'Whole-house estate sale. Dining set, sideboard, 400 records and boxes of vintage kitchenware. Cash or card.', '[["Date","Sat, Nov 7"],["Hours","8 AM – 3 PM"],["Parking","Street"]]', now() - interval '1 day', true),
('ranch-newburgh', 'Lakeside Realty', 'Agent', 'home', '3 bed, 2 bath ranch with a fenced yard', 'Newburgh, IN', '$289,000', 'Move-in ready', 'Updated ranch on a quiet street with a fenced backyard, new roof and a two-car garage.', '[["Bedrooms","3"],["Bathrooms","2"],["Living area","1,850 sq ft"],["Lot","0.3 acre"]]', now() - interval '2 days', true),
('maker-market', 'Riverfront Events', 'Organizer', 'event', 'Fall Maker Market: local vendors, food trucks and live music', 'Evansville, IN', 'Free', 'All ages', 'Forty local makers, a food truck row and live music along the riverfront.', '[["Date","Sat, Nov 14"],["Time","10 AM – 5 PM"],["Admission","Free"]]', now() - interval '3 days', true),
('pasture-posey', 'Tom B.', 'Private seller', 'land', '12.5 acres of open pasture with a pond', 'Posey County, IN', '$85,000', 'Vacant', 'Open pasture with road frontage, a stocked pond and a tree line along the east side.', '[["Acres","12.5"],["Zoning","Agricultural"],["Road access","County road"]]', now() - interval '4 days', true),
('angus-heifer', 'Beck Farm', 'Private seller', 'livestock', 'Registered Angus heifer, 14 months, bred', 'Henderson, KY', '$1,800', 'Registered', 'Registered Angus heifer, bred to a calving-ease bull. Papers available, up to date on vaccines.', '[["Breed","Angus"],["Age","14 months"],["Number available","1"]]', now() - interval '0 days', true),
('multi-family', 'Newburgh Neighbors', 'Private seller', 'sale', 'Multi-family yard sale: tools, baby gear and furniture', 'Newburgh, IN', '$1 – $250', 'Used - Good', 'Three families clearing out. Tools, baby gear, furniture and kitchen items.', '[["Date","Sat, Nov 7"],["Hours","8 AM – 2 PM"]]', now() - interval '0 days', true),
('f150', 'Ray M.', 'Private seller', 'car', '2014 Ford F-150 XLT 4x4, crew cab', 'Mount Vernon, IN', '$14,900', 'Used - Good', 'Crew cab XLT with the 5.0 V8, bed liner and tow package. Runs strong.', '[["Year","2014"],["Mileage","118,000"],["Drive","4x4"]]', now() - interval '1 day', true),
('neighborhood-sale', 'Maple St. Neighbors', 'Private seller', 'sale', 'Neighborhood sale: bikes, toys and holiday decor', 'Mount Carmel, IL', '$1 – $120', 'Used - Fair', 'Street-wide sale with kids bikes, toy bins and boxes of holiday decor.', '[["Date","Sun, Nov 8"],["Hours","9 AM – 1 PM"]]', now() - interval '1 day', true),
('acoustic-night', 'Riverfront Taproom', 'Venue', 'event', 'Acoustic Night at the Riverfront Taproom', 'Evansville, IN', '$10', '21+', 'Three local acts on the taproom stage. Doors at 7.', '[["Date","Fri, Nov 6"],["Doors","7 PM"],["Age","21+"]]', now() - interval '5 days', true),
('boer-goats', 'Hollis Farm', 'Private seller', 'livestock', 'Boer goats: three does and a buck', 'Newburgh, IN', '$900', 'Vaccinated', 'Three does and a buck, all vaccinated and dewormed. Sold as a group.', '[["Breed","Boer"],["Number available","4"],["Ages","1 to 3 years"]]', now() - interval '2 days', true),
('moving-sale', 'Cole family', 'Private seller', 'sale', 'Moving sale: appliances, patio set and workshop tools', 'Henderson, KY', '$1 – $350', 'Used - Good', 'Moving across the country. Washer and dryer, patio set and a full workshop.', '[["Date","Sat, Nov 7"],["Hours","8 AM – 4 PM"]]', now() - interval '3 days', true),
('harley', 'Jake S.', 'Private seller', 'moto', '2018 Harley-Davidson Street Glide, 12k miles', 'Evansville, IN', '$16,900', 'Used - Excellent', 'Garage kept, saddlebags and upgraded exhaust. Clean title.', '[["Year","2018"],["Mileage","12,000"],["Engine","107 ci"]]', now() - interval '0 days', true),
('searay', 'Lakeview Marine', 'Dealer', 'boat', '2016 Sea Ray 21 ft bowrider with trailer', 'Henderson, KY', '$22,500', 'Used - Good', 'Low hours, bimini top and a matching trailer. Winterized this week.', '[["Year","2016"],["Length","21 ft"],["Hours","210"]]', now() - interval '2 days', true),
('cargo-trailer', 'Gary P.', 'Private seller', 'trailer', '16 ft enclosed cargo trailer, ramp door', 'Boonville, IN', '$4,800', 'Used - Good', 'Tandem axle, ramp door, interior lights and a side door.', '[["Length","16 ft"],["Type","Enclosed cargo"],["Axles","2"]]', now() - interval '4 days', true),
('jd-tractor', 'Tri-County Equipment', 'Dealer', 'farm', 'John Deere 5055E tractor with loader', 'Posey County, IN', '$24,000', 'Used - Good', '5055E with loader and 3-point hitch. Hour meter reads 1,420.', '[["Year","2015"],["Hours","1,420"],["Drive","4WD"]]', now() - interval '3 days', true),
('dresser', 'Priya R.', 'Private seller', 'furniture', 'Mid-century walnut dresser, six drawers', 'Newburgh, IN', '$120', 'Used - Good', 'Solid walnut with original brass pulls. Drawers slide smoothly.', '[["Material","Solid walnut"],["Width","60 in"],["Drawers","6"]]', now() - interval '1 day', true),
('fridge', 'Marcus L.', 'Private seller', 'appliance', 'Samsung French-door refrigerator, stainless', 'Evansville, IN', '$450', 'Used - Good', 'Five years old, ice maker works, no dents. Pickup only.', '[["Brand","Samsung"],["Capacity","28 cu ft"],["Finish","Stainless"]]', now() - interval '2 days', true),
('dewalt', 'Chris D.', 'Private seller', 'tools', 'DeWalt 20V cordless drill and impact set', 'Mount Vernon, IN', '$95', 'Like new', 'Drill, impact driver, two batteries and charger in the case.', '[["Brand","DeWalt"],["Voltage","20V"],["Batteries","2"]]', now() - interval '0 days', true),
('mower', 'Ben A.', 'Private seller', 'garden', 'Husqvarna zero-turn mower, 54 in deck', 'Princeton, IN', '$3,200', 'Used - Good', 'Zero-turn with a 54 in deck, serviced this fall.', '[["Brand","Husqvarna"],["Deck","54 in"],["Hours","310"]]', now() - interval '3 days', true),
('sony-tv', 'Amy T.', 'Private seller', 'electronics', 'Sony 65 in 4K TV with wall mount', 'Evansville, IN', '$380', 'Like new', '65 in 4K smart TV, wall mount included. Remote and box available.', '[["Brand","Sony"],["Size","65 in"],["Resolution","4K"]]', now() - interval '1 day', true),
('trek-bike', 'Lena K.', 'Private seller', 'sports', 'Trek mountain bike, medium frame, 29 in', 'Newburgh, IN', '$520', 'Used - Good', 'Medium frame, 29 in wheels, hydraulic disc brakes.', '[["Brand","Trek"],["Frame","Medium"],["Wheels","29 in"]]', now() - interval '2 days', true),
('boys-lot', 'Rosa M.', 'Private seller', 'clothing', 'Boys 4T to 6 clothing lot, 40 pieces', 'Henderson, KY', '$35', 'Used - Good', 'Forty pieces, mostly Carter''s and Gap, winter coats included.', '[["Sizes","4T to 6"],["Pieces","40"]]', now() - interval '4 days', true),
('crib', 'Nina V.', 'Private seller', 'kids', 'Graco convertible crib and changing table', 'Boonville, IN', '$140', 'Like new', 'Converts to a toddler bed. Mattress included, smoke-free home.', '[["Brand","Graco"],["Includes","Mattress"]]', now() - interval '3 days', true),
('hoosier', 'Old Mill Antiques', 'Dealer', 'antiques', 'Hoosier cabinet, early 1900s, original flour bin', 'Mount Carmel, IL', '$650', 'Antique', 'Original enamel top and flour bin, maker label intact.', '[["Era","Early 1900s"],["Size","70 x 40 x 25 in"]]', now() - interval '5 days', true),
('yamaha', 'Sam L.', 'Private seller', 'music', 'Yamaha acoustic guitar with hard case', 'Evansville, IN', '$210', 'Used - Good', 'Solid-top acoustic with a hard case. Plays well.', '[["Brand","Yamaha"],["Includes","Hard case"]]', now() - interval '1 day', true),
('puppies', 'Wells Kennel', 'Private seller', 'pets', 'Golden retriever puppies, 8 weeks, first shots', 'Newburgh, IN', '$600', 'Vaccinated', 'Four puppies left, first shots done, parents on site.', '[["Breed","Golden retriever"],["Age","8 weeks"],["Available","4"]]', now() - interval '0 days', true),
('lawn-care', 'Green Edge Lawn', 'Business', 'services', 'Lawn mowing and fall cleanup, weekly or one time', 'Evansville, IN', 'From $45', 'Insured', 'Insured crew serving Vanderburgh and Warrick counties.', '[["Area","Vanderburgh and Warrick"],["Rate","From $45 per visit"]]', now() - interval '2 days', true),
('line-cook', 'Riverside Grill', 'Employer', 'jobs', 'Line cook, full time, benefits after 60 days', 'Evansville, IN', '$16 – $19 / hr', 'Full time', 'Busy riverfront kitchen. Weekends required, benefits after 60 days.', '[["Pay","$16 – $19 per hour"],["Hours","35 to 40 a week"]]', now() - interval '0 days', true),
('free-boxes', 'Ellie C.', 'Private seller', 'free', 'Free: moving boxes and packing paper, 30+ boxes', 'Newburgh, IN', 'Free', 'Porch pickup', 'Thirty-plus boxes and a big roll of packing paper on the porch.', '[["Pickup","Porch, any time today"],["Quantity","30+ boxes"]]', now() - interval '0 days', true);
