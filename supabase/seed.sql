-- Données de test — ne jamais exécuter en production
insert into public.references (code, nom_commercial, collection, finition, couleur_dominante, texture_url)
values
  ('aa04', 'Chêne naturel', 'wood', 'mat', 'beige', 'https://cms.coverstyl.com/img-optim/cover-styl/web/aa04.jpg'),
  ('ne24', 'Béton gris clair', 'concrete', 'mat', 'gris', 'https://cms.coverstyl.com/img-optim/cover-styl/web/ne24.jpg'),
  ('nd05', 'Pierre ardoise', 'stone', 'structure', 'anthracite', 'https://cms.coverstyl.com/img-optim/cover-styl/web/nd05.jpg'),
  ('mk18', 'Blanc mat', 'color', 'mat', 'blanc', 'https://cms.coverstyl.com/img-optim/cover-styl/web/mk18.jpg'),
  ('nh10', 'Acier brossé', 'metal', 'satine', 'argent', 'https://cms.coverstyl.com/img-optim/cover-styl/web/nh10.jpg')
on conflict (code) do nothing;
