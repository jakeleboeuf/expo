require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name            = 'EXPermissions'
  s.version         = package['version']
  s.summary         = package['description']
  s.description     = package['description']
  s.license         = package['license']
  s.author          = package['author']
  s.homepage        = package['homepage']
  s.platform        = :ios, '10.0'
  s.source          = { git: 'https://github.com/expo/expo.git' }
  s.source_files    = "EXPermissions/*.{h,m}",
                      "EXPermissions/Requesters/UserNotification/*.{h,m}",
                      "EXPermissions/Requesters/RemoteNotification/*.{h,m}"
                      
  s.requires_arc    = true

  s.dependency 'UMCore'
  s.dependency 'UMPermissionsInterface'

end
