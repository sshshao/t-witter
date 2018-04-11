iptables -D INPUT -i ens3 -p tcp --dport 80 -j ACCEPT
iptables -D INPUT -i ens3 -p tcp --dport 8080 -j ACCEPT
iptables -D PREROUTING -t nat -i ens3 -p tcp --dport 80 -j REDIRECT --to-port 30001